const registry = require('beyond/externals/registry');

module.exports = class {
    #dependencies;
    #cache;

    #value;
    get value() {
        return this.#value;
    }

    #processing = false;
    get processing() {
        return this.#processing;
    }

    #processed = false;
    get processed() {
        return this.#processed;
    }

    #errors;
    /**
     * The list of errors generated while processing the dependencies tree
     * @return {Map<string, string>}
     */
    get errors() {
        return this.#errors;
    }

    #list;
    /**
     * The flat list of packages required by the dependency tree
     * @return {Map<string, {version}>}
     */
    get list() {
        return this.#list;
    }

    #time;
    /**
     * Timestamp when the last process was made
     * @return {number}
     */
    get time() {
        return this.#time;
    }

    constructor(dependencies, cache) {
        this.#dependencies = dependencies;
        this.#cache = cache;
    }

    /**
     * Process the flat list of packages and errors after the dependencies tree was processed
     */
    #postprocess() {
        const list = new Map();
        const errors = new Map();

        const recursive = dependencies => dependencies.forEach(({error, dependencies, version, vpackage}, name) => {
            const vspecifier = `${name}@${version}`;
            if (error) {
                errors.set(vspecifier, {error});
                return;
            }

            list.set(vspecifier, {vpackage, dependencies});
            dependencies && recursive(dependencies);
        });
        recursive(this);

        this.#list = list;
        this.#errors = errors;
    }

    #request;

    cancel() {
        this.#request = void 0;
    }

    async process() {
        this.#processing = true;

        const request = this.#request = Date.now();

        const recursive = async dependencies => {
            const output = new Map();

            for (const [name, {kind, version}] of dependencies) {
                if (kind === 'development') continue;

                const pkg = registry.obtain(name);

                const done = data => {
                    this.#processing = false;
                    this.#processed = true;
                    this.#time = Date.now();
                    this.#cache.save(data);

                    const {error, vpackage} = data;
                    const dependencies = data.dependencies ? data.dependencies : new Map();
                    if (error) {
                        output.set(name, {error});
                        return;
                    }

                    const {version} = vpackage;
                    output.set(name, {vpackage, version, dependencies});
                }

                const {error} = await pkg.fetch();
                if (this.#request !== request) return;

                if (error) {
                    done({error: `Error fetching package "${name}": ${error}`});
                    continue;
                }

                const vpackage = pkg.version(version);
                if (!vpackage) {
                    done(({error: `Dependency version "${version}" is not valid`}));
                    continue;
                }

                const dependencies = await recursive(vpackage.dependencies);
                if (this.#request !== request) return;

                done({vpackage, dependencies});
            }

            return output;
        }

        const dependencies = await recursive(this.#dependencies);
        dependencies.forEach((value, key) => this.set(key, value));
        this.#postprocess();
    }
}
