const Browser = require('./browser');

module.exports = class {
    #manager;

    constructor(specs, inspect) {
        const {platform} = specs;
        const Manager = (() => {
            if (platform === 'browser') return Browser;
        })();

        this.#manager = new Manager(specs, inspect);
    }

    async start() {
        return this.#manager.start();
    }
}
