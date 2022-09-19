/**
 * The collection of BeyondJS bundles imported by the application
 */
module.exports = class extends Map {
    /**
     * Import a bundle or a list of bundles
     *
     * @param required {string | string[]} The bundle that are required to be imported
     * @param start {boolean} Is it importing the required bundles in the starting process?
     * @return {Promise<Map<string, {errors: string[], bundle: object, exception: Error}>>}
     */
    async import(required, start) {
        !start && await this.#bee.ready;

        required = typeof required === 'string' ? [required] : required;
        if (!(required instanceof Array)) throw new Error('Invalid parameters');

        const response = () => {
            const response = required.filter(required => this.#errors.has(required) || this.has(required))
                .map(required => this.#errors.has(required) ?
                    [required, {errors: this.#errors.get(required)}] :
                    [required, {exports: this.get(required).exports}]);

            return new Map(response);
        }

        const promise = Promise.pending();
        filtered.forEach(bundle => this.#importing.set(bundle, promise));

        if (filtered.length) {
            // Resolve and delete importing promises
            const done = () => {
                filtered.forEach(bundle => this.#importing.get(bundle).resolve());
                filtered.forEach(bundle => this.#importing.delete(bundle));
            }

            try {
                const loaded = new Map(response);

                // Process bundles received with errors
                loaded.forEach(({errors}, resource) => {
                    if (!errors) return;
                    this.#errors.set(resource, errors);
                    loaded.delete(resource);
                });

                // Check if any of the requested bundles were not found
                filtered.forEach(required => {
                    if (loaded.has(required)) return;
                    this.#errors.set(required, ['Resource not found']);
                    loaded.delete(required);
                });

                if (!loaded.size) {
                    done();
                    return response();
                }

                // Resolve the bundles that has their dependencies already processed


                // Load the filtered dependencies of the bundles recently loaded
                const dependencies = new Set();
                loaded.forEach(({dependencies: d}) => d.forEach(({resource, kind}) => {
                    ['bundle', 'transversal'].includes(kind) && dependencies.add(resource);
                }));

                // Importing dependencies
                dependencies.size && await this.import([...dependencies], start);

                // Instantiate the bundles that has been loaded and their dependencies have no errors
                loaded.forEach(({is, code, map}, id) => {

                    this.set(id, new (require('./bundle'))(this, is, id, code, map));
                });

                done();
            }
            catch (exc) {
                console.log(`Error getting bundles: ${[...filtered]}`, exc.stack);
                filtered.forEach(required => this.#errors.set(required, ['Bundle import failed']));
                done();
                return response();
            }
        }

        await Promise.all([...importing]);
        return response();
    }
}
