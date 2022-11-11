const Browser = require('./browser');
const DependenciesTree = require('beyond/dependencies-tree');

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
        this.#dependencies = new DependenciesTree(dependencies);
    }

    async start() {
        return this.#manager.start();
    }

    destroy() {
        this.#manager?.destroy();
    }
}
