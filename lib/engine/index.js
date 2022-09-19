const {fork} = require('child_process');

module.exports = class {
    #process;
    get process() {
        return this.#process;
    }

    /**
     *  BeyondJS local engine constructor
     *
     * @param root {string} The root folder of the instance
     */
    constructor(root) {
        this.#process = fork(
            require('path').join(__dirname, 'process', 'index.js'),
            [JSON.stringify({dirname: root})],
            {cwd: process.cwd()});

        const {ipc} = global.utils;
        ipc.register('engine', this.#process);
    }
}
