const Browser = require('./browser');
const {Tree: DependenciesTree, Config: DependenciesConfig} = require('beyond/dependencies');

module.exports = class {
    #manager;
    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    #name;
    get name() {
        return this.#name;
    }

    constructor(specs, inspect) {
        const {name, platform, dependencies} = specs;
        this.#name = name;

        const Manager = (() => {
            if (platform === 'browser') return Browser;
        })();

        this.#manager = new Manager(specs, inspect);
        this.#dependencies = (() => {
            const config = new DependenciesConfig({dependencies});
            return new DependenciesTree(config);
        })();
    }

    async start() {
        return this.#manager.start();
    }

    destroy() {
        this.#manager?.destroy();
    }
}
