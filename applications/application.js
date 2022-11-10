const Browser = require('./browser');
const DependenciesTree = require('beyond/dependencies-tree');

module.exports = class {
    #manager;
    #dependencies;

    constructor(specs, inspect) {
        const {platform, dependencies} = specs;
        const Manager = (() => {
            if (platform === 'browser') return Browser;
        })();

        this.#manager = new Manager(specs, inspect);
        this.#dependencies = new DependenciesTree(dependencies);
    }

    async start() {
        return this.#manager.start();
    }
}
