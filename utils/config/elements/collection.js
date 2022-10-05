const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'utils.config.collection';
    }

    get config() {
        return this.children.get('config').child;
    }

    get errors() {
        return this.config.errors;
    }

    get warnings() {
        return this.config.warnings;
    }

    get valid() {
        return this.config.valid;
    }

    constructor(config) {
        super();
        super.setup(new Map([['config', {child: config}]]));
    }

    // This method should be overridden to process the configuration, and also can be used
    // to alter the configuration of the items (modify, add or remove) before creating the instances
    _processConfig(items) {
        return items;
    }

    // This method should be overridden
    _createItem(config) {
        void (config);
        throw new Error('This method should be overridden');
    }

    _deleteItem(item) {
        item.destroy();
    }

    _process() {
        const {config} = this;
        if (!config.valid) {
            this.clear();
            return;
        }

        let items = this._processConfig(new Map(config.items));
        items = items ? items : new Map();

        const updated = new Map();
        for (const [path, config] of items) {
            const item = this.has(path) ? this.get(path) : this._createItem(config);
            if (item.path !== path) throw new Error(`Item must specify its path`);
            updated.set(path, item);
        }

        // Destroy unused items
        this.forEach(item => !updated.has(item.path) && this._deleteItem(item));

        // Set the updated data into the collection
        super.clear(); // Do not use this.clear(), as it would destroy libraries still being used
        updated.forEach((value, key) => this.set(key, value));
    }

    clear() {
        this.forEach(item => item.destroy());
        super.clear();
    }

    destroy() {
        super.destroy();
        this.clear();
    }
}
