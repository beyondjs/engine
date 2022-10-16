const DynamicProcessor = require('beyond/utils/dynamic-processor');
const registry = require('beyond/externals/registry');

module.exports = class extends DynamicProcessor() {
    #dependencies;

    #processing = false;
    get processing() {
        return this.#processing;
    }

    #processed = false;
    get processed() {
        return this.#processed;
    }

    #value;
    get value() {
        return this.#value;
    }

    #time;
    /**
     * Timestamp when the last process was made
     * @return {number}
     */
    get time() {
        return this.#time;
    }

    constructor(dependencies) {
        super();
        this.#dependencies = dependencies;
    }

    #request;

    cancel() {
        this.#request = void 0;
    }

    async process() {
        if (this.#processing) return;
        this.#processing = true;
        this._invalidate();

        const request = this.#request = Date.now();

        const recursive = async dependencies => {
            const output = new Map();

            for (const [name, {kind, version}] of dependencies) {
                if (kind === 'development') continue;

                const pkg = registry.obtain(name);

                const done = ({vpackage, dependencies, error}) => {
                    if (error) {
                        output.set(name, {error});
                        return;
                    }

                    const {version} = vpackage;
                    output.set(name, {version, dependencies});
                }

                await pkg.fetch();
                if (this.#request !== request) return;

                if (pkg.error) {
                    done({error: `Error fetching package "${name}": ${pkg.error}`});
                    continue;
                }

                const vpackage = pkg.version(version);
                if (!vpackage) {
                    done(({error: `Dependency version "${version}" cannot be satisfied`}));
                    continue;
                }

                const dependencies = await recursive(vpackage.dependencies);
                if (this.#request !== request) return;

                done({vpackage, dependencies});
            }

            return output;
        }

        const value = await recursive(this.#dependencies);
        if (this.#request !== request) return;

        this.#processing = false;
        this.#processed = true;
        this.#value = value;
        this.#time = Date.now();

        this._invalidate();
    }
}
