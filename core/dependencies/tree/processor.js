const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {registry} = require('beyond/externals');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'dependencies-tree.processor';
    }

    #dependencies;
    #packages;

    #working = false;
    get working() {
        return this.#working;
    }

    #done = false;
    get done() {
        return this.#done;
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

        // Do not use 'beyond/packages' at the beginning of the file to a avoid circular dependency
        this.#packages = require('beyond/packages');
    }

    #request;

    cancel() {
        this.#request = void 0;
    }

    async process() {
        if (this.#working) return;
        this.#working = true;
        this._invalidate();

        const request = this.#request = Date.now();

        /**
         * Al internal packages must be ready to process the dependencies tree
         */
        const packages = this.#packages;
        await packages.ready;
        if (this.#request !== request) return;
        const promises = [];
        packages.forEach(pkg => promises.push(pkg.ready));
        await Promise.all(promises);
        if (this.#request !== request) return;

        /**
         * Recursively find the dependencies
         * @param dependencies
         * @return {Promise<Map<string, *>>}
         */
        const recursive = async dependencies => {
            const output = new Map();

            for (const [name, {kind, version}] of dependencies) {
                if (kind === 'development') continue;

                const done = ({vpackage, dependencies, error}) => {
                    if (error) {
                        output.set(name, {error});
                        return;
                    }

                    const {version} = vpackage;
                    output.set(name, {version, dependencies});
                }

                let pkg;

                /**
                 * Check if the dependency is an internal package
                 */
                const vname = `${name}@${version}`;
                pkg = this.#packages.find({vname});
                if (pkg) {
                    if (!pkg.valid) {
                        done({error: `Package ${vname} has reported errors`});
                        continue;
                    }

                    const dependencies = await recursive(pkg.dependencies.config);
                    if (this.#request !== request) return;
                    done({vpackage: pkg, dependencies});
                    continue;
                }

                /**
                 * Look up the dependency in NPM
                 */
                pkg = registry.obtain(name);
                await pkg.fill();
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

        const value = await recursive(this.#dependencies.config);
        if (this.#request !== request) return;

        this.#working = false;
        this.#done = true;
        this.#value = value;
        this.#time = Date.now();

        this._invalidate();
    }
}
