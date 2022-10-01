const {FinderCollection} = global.utils;
const Source = require('./source');

module.exports = class extends FinderCollection {
    #processor;
    get processor() {
        return this.#processor;
    }

    #hash;
    get hash() {
        return this.#hash;
    }

    #extname;
    #overwrites;

    constructor(processor, extname) {
        const {specs} = processor;
        const {watcher} = specs;
        super(watcher, Source, {items: {subscriptions: ['change']}});

        this.#processor = processor;
        this.#extname = extname;

        const {template} = specs.application;

        // The overwrites id
        const id = `${specs.bundle.container.specifier}/${specs.bundle.type}`;
        this.#overwrites = template.overwrites.get(id);
        this.#overwrites.on('change', this.update);
        this.#overwrites.initialised ? this.update() : this.#overwrites.on('initialised', this.update);

        this.#hash = new (require('../hash'))(this);
    }

    update = () => {
        let {config, path} = this.#overwrites;
        const pname = this.#processor.name;

        if (!path || !config || !config.hasOwnProperty(pname)) {
            this.configure();
            return;
        }

        path = require('path').join(this.#overwrites.path, config.path ? config.path : '');
        config = config[pname];
        path = require('path').join(this.#overwrites.path, config.path ? config.path : '');

        let includes = typeof config === 'string' || config instanceof Array ? config : config.files;
        includes = typeof includes === 'string' ? [includes] : includes;

        config = {includes: includes, extname: this.#extname};
        super.configure(path, config);
    }

    destroy() {
        this.#overwrites.off('initialised', this.update);
        this.#overwrites.off('change', this.update);
    }
}
