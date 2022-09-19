/**
 * Avoid reprocessing the dp when the request ids of the children are the same as the last processing performed.
 * It occurs when the children are linked to each other.
 * This occurs when there are child processors that in turn are children of another.
 *
 * Ex: In the ts compiler, the compiler depends on the analyzer in the same way that dependencies.declarations
 * depends on the analyzer as well.
 */
module.exports = class {
    #dp;
    #monitor

    #state = new Map();

    /**
     * Dynamic processor processing state ids constructor
     *
     * @param dp {object} The dynamic processor
     * @param monitor {object} The dynamic processor monitor
     */
    constructor(dp, monitor) {
        this.#dp = dp;
        this.#monitor = monitor;
    }

    /**
     * Check if the state of the children is the same as when the last processing was performed, and therefore,
     * it is not necessary to process again
     */
    get updated() {
        const children = this.#monitor.items;
        if (!children.size) return false;

        return [...children].reduce((prev, child) =>
            prev && this.#state.has(child) && this.#state.get(child) === child._request, true);
    }

    update() {
        this.#state.clear();

        const children = this.#monitor.items;
        children.forEach(child => this.#state.set(child, child._request));
    }

    invalidate() {
        this.#state.clear();
    }
}
