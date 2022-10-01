/**
 * Child wrapper
 * Responsible for registering and deregistering the events of the child
 */
module.exports = class {
    #dp;
    get dp() {
        return this.#dp;
    }

    #child;
    get child() {
        return this.#child;
    }

    // The invalidation events to which the child is subscribed
    #subscriptions = new Set();

    #invalidate = () => this.#dp._invalidate();

    // A child has been processed, but its state has not been changed (event 'change' is not emitted)
    #reevaluate = () => this.#dp.waiting && this.#dp._invalidate();

    /**
     * Child wrapper constructor
     *
     * @param name {string} The name under which the child was registered in the dp
     * @param dp {object} The parent dynamic processor
     * @param child {object} The child dynamic processor
     * @param subscriptions {object} The invalidation events of the dp emitted by the child
     */
    constructor(name, dp, child, subscriptions) {
        if (typeof name !== 'string') throw new Error('Invalid child name specification');

        if (!child) {
            throw new Error(`Child property "${name}" is undefined`);
        }
        if (typeof child.on !== 'function' || typeof child.initialise !== 'function') {
            throw new Error(`Child property "${name}" is not a dynamic processor`);
        }
        if (!child.dp) {
            throw new Error(`Child "${name}" must have the property .dp set`);
        }

        this.#dp = dp;
        this.#child = child;

        child.on('change', this.#invalidate);
        child.on('processed', this.#reevaluate);

        subscriptions = subscriptions ? subscriptions : [];
        this.#subscriptions = subscriptions = subscriptions.filter(event => {
            if (typeof event !== 'string') throw new Error('Invalid event type, it should be string');
            return !['initialised', 'change'].includes(event);
        });
        subscriptions.forEach(event => child.on(event, this.#invalidate));
    }

    /**
     * Destroy the child wrapper
     */
    destroy() {
        const child = this.#child;
        child.off('change', this.#invalidate);
        child.off('processed', this.#reevaluate);

        this.#subscriptions.forEach(event => child.off(event, this.#invalidate));
    }
}
