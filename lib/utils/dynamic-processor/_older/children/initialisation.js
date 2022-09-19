/**
 * This class exists to avoid executing the _process method in the following case:
 *
 * There can be a situation in which two (or more) child processors emit the "initialised" event on initialisation.
 * In this case, both have the .processed property set to true, therefore they would pass the _prepared property correctly,
 * but immediately after the current object is processed, the "initialised" event of the second object will be received,
 * processing more than once.
 */
module.exports = class {
    #dp;

    // The children that are already initialised
    #initialised = new Set();

    // The subscriptions to the 'initialised' events, to unregister the listener when object is destroyed
    #subscriptions = new Map();

    #children = new Map();

    constructor(dp) {
        this.#dp = dp;
    }

    get completed() {
        const {children} = this.#dp;
        return children.size === this.#initialised.size;
    }

    #oninitialised = name => {
        this.#initialised.add(name);
        const {children} = this.#dp;
        children.prepared && this.#dp._invalidate();
    }

    register(name, child) {
        if (child.initialised) {
            this.#initialised.add(name);
            return;
        }

        const oninitialised = () => {
            this.#oninitialised(name);
            if (!this.#subscriptions.has(name)) return;
            child.off('initialised', this.#subscriptions.get(name));
        }

        this.#subscriptions.set(name, oninitialised);
        this.#children.set(name, child);
        child.on('initialised', oninitialised);
    }

    unregister(name) {
        if (!this.#subscriptions.has(name)) throw new Error('Child is not registered');

        const child = this.#children.get(name);
        child.off('initialised', this.#subscriptions.get(name));
        this.#subscriptions.delete(name);
        this.#initialised.delete(name);
    }

    /**
     * Initialise children
     *
     * @return {Promise<void>}
     */
    async initialise() {
        const promises = [];
        this.#children.forEach(child => {
            if (child.initialised || child.initialising) return;

            const initialise = child.initialise();
            initialise instanceof Promise && promises.push(initialise);
        });
        await Promise.all(promises);
    }

    destroy() {
        [...this.#subscriptions.keys()].forEach(name => this.unregister(name));
        this.#subscriptions.clear();
        this.#children.clear();
        this.#initialised.clear();
    }
}
