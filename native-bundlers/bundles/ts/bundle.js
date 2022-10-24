const {Bundle} = require('beyond/bundler-helpers');

module.exports = class extends Bundle {
    configure(config) {
        if (typeof config === 'string') return super.configure({files: config});
        if (config instanceof Array) return super.configure({files: config});
        if (typeof config !== 'object') return super.configure(config);

        const reserved = ['name', 'platforms', 'path', 'imports'];

        const preprocessed = {};
        for (const prop of reserved) {
            if (config[prop] === void 0) continue;
            preprocessed[prop] = config[prop];
            delete config[prop];
        }
        preprocessed.ts = config;

        return super.configure(preprocessed);
    }
}
