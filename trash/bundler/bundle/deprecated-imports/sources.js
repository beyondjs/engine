const {FinderCollection} = global.utils;

/**
 * Just for backward compatibility! This class is deprecated!
 * module.json imports property configuration
 */
module.exports = class extends FinderCollection {
    constructor(watcher) {
        super(watcher, FinderCollection.Item, {items: {subscriptions: ['change']}});
    }

    configure(path, config) {
        config = typeof config === 'string' ? [config] : config;
        if (!(config instanceof Array)) {
            super.configure();
            return;
        }
        super.configure(path, {includes: config, extname: '.js'});
    }
}
