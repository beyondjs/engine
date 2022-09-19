const Processor = require('./processor');
module.exports = class {
    #items = new Map();
    get items() {
        return this.#items;
    }

    skeleton = [];

    constructor(config) {
        Object.entries(config).forEach(([key, value]) => this.#items.set(key, new Processor(key, value)));
    }

    getContent() {
        const json = {}, output = {};
        this.items.forEach(item => Object.assign(output, item.getContent()));
        json.processors = output;
        return json;
    }

    setValues(specs) {
        specs.forEach(config => {
            const processor = this.items.get(config.processor);
            processor.setValues(config);
        });
    }
}