module.exports = class {
    #launchers;
    get launchers() {
        return this.#launchers;
    }

    constructor(service) {
        void service;
        this.#launchers = new (require('./launchers'))();
    }
}
