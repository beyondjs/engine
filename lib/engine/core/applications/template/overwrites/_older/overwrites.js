/**
 * Overwrites of the containers
 * The containers can be libraries or modules in the form: 'libraries/library_name' or 'module.id'
 */
module.exports = function () {
    'use strict';

    const overwrites = new Map;
    const config = new (require('./config.js'));

    this.has = id => overwrites.has(id);

    this.get = function (id) {
        if (overwrites.has(id)) return overwrites.get(id);

        const container = new (require('./container.js'))(id);
        overwrites.set(id, container);
        return container;
    }

    this.configure = function (path, value) {
        config.process(value);
        value = config.processed;

        // Clean up overwrites that are not configured
        [...overwrites.keys()]
            .forEach(id => !value.hasOwnProperty(id) ? overwrites.get(id).configure() : null);

        for (const id of Object.keys(value)) {
            let container;
            if (overwrites.has(id)) {
                container = overwrites.get(id);
            }
            else {
                container = new (require('./container.js'))(id);
                overwrites.set(id, container);
            }

            container.configure(path, value[id]);
        }
    }

    /**
     * Used only by the application object, when it is destroyed
     */
    this.destroy = () => overwrites.forEach(container => container.destroy());
}
