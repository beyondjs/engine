const {ipc} = global.utils;

module.exports = class {
    #bee;

    constructor(bee) {
        this.#bee = bee;
    }

    async get(module) {
        const {distribution, project} = this.#bee.specs;

        // Request the code of the bundles by IPC
        const params = [project.id, module, distribution];
        return await ipc.exec('main-client', 'bridges/get', ...params);
    }
}
