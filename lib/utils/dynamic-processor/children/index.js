module.exports = class extends require('./registered') {
    #required;
    get required() {
        return this.#required;
    }

    #monitor;
    get monitor() {
        return this.#monitor;
    }

    get pending() {
        return this.#monitor.pending;
    }

    /**
     * DP Children constructor
     *
     * @param dp {object} The parent dynamic processor
     * @param ready {function} The function to call when the children get ready
     */
    constructor(dp, ready) {
        super(dp);
        this.#required = new (require('./required'))(dp);
        this.#monitor = new (require('./monitor'))(dp, this, ready);
    }

    /**
     * The pendings are registered when the check(dp) function is called in the _prepared method
     * If the processor that is being requested is not processed, then it is registered as a pending dp
     *
     * @param child {object} The pending dp
     * @param data {{id: string}} Information provided when the check function is called
     */
    require(child, data) {
        if (this.dp === child) throw new Error('Requiring itself as a child processor');
        this.#required.register(child, data);
    }

    reset() {
        return this.#required.reset();
    }

    get prepared() {
        return this.#monitor.prepared;
    }

    initialise() {
        this.#monitor.initialise();
    }

    update() {
        return this.#monitor.update();
    }

    destroy() {
        this.#monitor.destroy();
    }
}
