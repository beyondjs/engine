require('colors');
const Text = require('./text');
const Static = require('./static');
const Processors = require('./processors');
module.exports = class {
    _BUNDLES = ['page', 'code', 'txt', 'static'];
    _MODELS = {static: Static, txt: Text, default: Processors};

    _processors = new Map();
    get processors() {
        return this._processors;
    }

    constructor(id, config) {
        this._id = id;

        const Model = this._MODELS.hasOwnProperty(id) ? this._MODELS[id] : this._MODELS.default;
        this._processors.set(id, new Model(config));
    }

    getContent() {
        const output = {};
        this.processors.forEach(processor => output[this._id] = processor.getContent());
        return output;
    }

    setValues(config) {
        const processorConfig = this.processors.get(config.bundle);
        if (this._MODELS.hasOwnProperty(this._id)) {
            processorConfig.setValues(config[config.bundle]);
            return;
        }

        const processor = processorConfig.items.get(config.processor);
        processor.setValues(config);
    }
}