const {fork} = require('child_process');

module.exports = class {
    #process;
    get process() {
        return this.#process;
    }

    /**
     *  BeyondJS local engine constructor
     *
     * @param dirname {string} The root folder of the instance
     * @param specs {{inspect: number}} The engine specification, actually the inspection port
     */
    constructor(dirname, specs) {
        const {inspect} = specs;

        this.#process = fork(
            require('path').join(__dirname, 'process', 'index.js'),
            [JSON.stringify({dirname, inspect})],
            {cwd: process.cwd()});

        const {ipc} = global.utils;
        ipc.register('engine', this.#process);
    }
}
