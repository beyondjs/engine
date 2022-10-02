const {ipc} = global.utils;

module.exports = class {
    #bee;
    #pending = new Map();  // The pending promises
    #requiring = new Set();
    #resolved = new Map();

    constructor(bee) {
        this.#bee = bee;
    }

    #process = () => {
        this.#timer = void 0;

        // Request the code of the bundles by IPC
        const required = [...this.#pending.keys()].filter(uri => !this.#requiring.has(uri));
        required.forEach(uri => this.#requiring.add(uri));

        const done = ({loaded, errors}) => {
            required.forEach(uri => {
                if (!this.#requiring.has(uri)) {
                    console.error(`A not required uri "${uri}" was received but never requested`);
                    return;
                }
                this.#requiring.delete(uri);
            });

            required.forEach(uri => {
                let resolved;
                if (errors) {
                    resolved = {errors};
                }
                else if (!loaded?.has(uri)) {
                    resolved = {errors: [`Resource "${uri}" not found`]};
                }
                else {
                    const {errors, is, code, map, dependencies} = loaded.get(uri);
                    resolved = errors ? {errors} : {is, code, map, dependencies};
                }

                this.#resolved.set(uri, resolved);

                try {
                    const promise = this.#pending.get(uri);
                    this.#pending.delete(uri);
                    promise.resolve(resolved);
                }
                catch (exc) {
                    console.error(exc.stack);
                }
            });
        }

        const {distribution, project} = this.#bee.specs;
        const params = [project.id, required, distribution];
        ipc.exec('main-client', 'code/bundles/get', ...params).then(response => {
            done({loaded: new Map(response)});
        }).catch((exc) => {
            console.error(`Error loading resources "${required}"`, exc.stack);
            done({errors: [`Error found loading resources: ${exc.message}`]});
        });
    }

    #timer;

    async load(uri) {
        if (this.#resolved.has(uri)) {
            console.error(`It is expected to call to load the resources only once. Resource "${uri}" already resolved`);
            return this.#resolved.get(uri);
        }

        if (this.#pending.has(uri)) {
            return await this.#pending.get(uri).value;
        }

        const promise = Promise.pending();
        this.#pending.set(uri, promise);

        this.#timer = this.#timer || setTimeout(this.#process, 0);
        return await promise.value;
    }
}
