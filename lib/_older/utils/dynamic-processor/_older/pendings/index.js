module.exports = class extends Map {
    #dp;
    #checkpoint;
    get checkpoint() {
        return this.#checkpoint;
    }

    constructor(dp) {
        super();
        this.#dp = dp;
        this.#checkpoint = new (require('./checkpoint'))(dp);
    }

    /**
     * The pendings are registered when the check(dp) function is called in the _prepared method
     * If the processor that is being requested is not processed, then it is registered as a pending dp
     *
     * @param pending {object} The pending dp
     * @param data {{id: string}} Information provided when the check function is called
     */
    register(pending, data) {
        pending._consumers.add(this.#dp);
        this.set(pending, data);
    }

    clear() {
        [...this.keys()].forEach(pending => pending._consumers.delete(this.#dp));
        super.clear();
    }
}
