const {Processor, Sources} = require('beyond/plugins/sdk');
const CSS = require('./css');

module.exports = class extends Processor {
    get dp() {
        return 'processor-sass';
    }

    static get name() {
        return 'sass';
    }

    #path;
    get path() {
        return this.#path;
    }

    #sources;
    get sources() {
        return this.#sources;
    }

    get hash() {
        return 0;
    }

    #css;
    get css() {
        return this.#css;
    }

    constructor(bundle, processors) {
        super(bundle, processors, {});

        this.#sources = new Sources(this, {extname: ['.scss']});
        this.#css = new CSS(this);
    }

    configure(config) {
        const {module} = this.plugin;
        this.#path = module.path;
        this.#sources.configure(module.path, config);
    }
}
