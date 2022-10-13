const Processor = require('./processor');
module.exports = class extends require('../../validator') {
    _path;
    _validProcessors = ['scss', 'less'];

    #items = new Map();
    get items() {
        return this.#items;
    }

    skeleton = ['path'];

    constructor(config) {
        super();

        this._path = config.path;
        this._validProcessors.forEach(processor => {
            if (!config.hasOwnProperty(processor)) return;
            this.#items.set(processor, new Processor(config[processor]));
        });
    }

    getContent() {
        const json = {path: this._path};

        const output = {};
        this.items.forEach((item, processor) => output[processor] = item.getContent());

        return {...json, ...output};
    }
}