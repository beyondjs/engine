const {EventEmitter} = require('events');

const Nothing = class {
};

let autoincremental = {id: 0, request: 0};

// A registry of all Dynamic Processors created across the instance of the engine
const registry = new Set();

// noinspection JSPotentiallyInvalidUsageOfThis
module.exports = (Base = Nothing) => class extends Base {
    _events = new EventEmitter();
    on = (event, listener) => {
        // To find if a dynamic processor hasn't set the maxListeners correctly
        const count = this._events.listenerCount(event);
        const max = this._events.getMaxListeners();

        if (max === count) {
            const message = `Max. listeners (${max}) achieved on dp "${this.dp}" - with id: "${this.id}"`;
            this.#logs.append(message);
            console.log(`${message}.\nCheck the logs: ${this.#logs.store}\n`);

            const consumers = (() => {
                let consumers = '';
                let count = 0;
                registry.forEach((consumer) => {
                    const {items: requiring} = consumer.children.monitor;
                    if (!requiring.has(this)) return;

                    const {dp, id} = consumer;
                    consumers += `\t* [${++count}] - dp "${dp}" - with id: "${id}"\n`;
                });
                return consumers;
            })();
            this.#logs.append(consumers);
        }

        this._events.on(event, listener);
    };
    off = (event, listener) => this._events.off(event, listener);
    removeALlListeners = () => this._events.removeAllListeners();
    setMaxListeners = n => this._events.setMaxListeners(n);

    // ms to wait to process after invalidation
    waitToProcess = 0;
    // Execute _notify method on first processing
    notifyOnFirst = false;

    #autoincremented = autoincremental.id++;
    get autoincremented() {
        return this.#autoincremented;
    }

    #children;
    get children() {
        return this.#children;
    }

    #logs;

    /**
     * Dynamic processor setup
     *
     * @param children {Map<string, {child: object}>} A map of children properties
     * where the key is the child object and the value is the specification object
     */
    setup(children) {
        this.#children.register(children, false, true);
    }

    // Is a property that is defined only when processing and before initialised
    #ready = Promise.pending();
    get ready() {
        if (this.#processed || this.#destroyed) return Promise.resolve();

        this.#ready = this.#ready || Promise.pending();

        if (!this.#initialising && !this.#initialised) {
            // Initialization triggers processing, and promise resolution
            this.initialise().catch(exc => console.error(exc.stack));
        }
        return this.#ready.value;
    }

    constructor(...params) {
        super(...params);
        registry.add(this);

        this.#children = new (require('./children'))(this, this.#preprocess);
        this.setMaxListeners(500);
        this.#logs = require('./logs');
    }

    get waiting() {
        return this.#children.waiting;
    }

    #initialising = false;
    get initialising() {
        return this.#initialising;
    }

    #initialised = false;
    get initialised() {
        return this.#initialised;
    }

    // This method can be overridden
    async _begin() {
    }

    async initialise() {
        if (typeof this.dp !== 'string' || !this.dp) throw new Error('Getter .dp must return a string');

        if (this.#destroyed || this.#initialising || this.#initialised) return;
        this.#initialising = true;

        await this._begin();

        this.#initialising = false;
        this.#initialised = true;

        // On children initialisation, and after all child objects are ready, the #preprocess method is called
        this.#children.initialise();
    }

    // The processor is processing, specifically in the preparation phase
    #preparing;
    get preparing() {
        return this.#preparing;
    }

    // This method should be overridden
    _prepared() {
    }

    // Is the processor prepared to process?
    // If not prepared, the promise will be kept pending, and will be processed at the next invalidation.
    get __prepared() {
        this.#preparing = true;
        this.#children.reset();

        // Check if dynamic processor is processed, but also initialise it if it wasn't previously initialised
        const require = (dp, id) => {
            this.#children.require(dp, {id});
            return dp.processed;
        };

        let prepared = this._prepared(require);
        if (typeof prepared === 'string') {
            this.#children.monitor.hang(prepared);
            prepared = false;
        }
        prepared = prepared === void 0 ? true : !!prepared;

        this.#preparing = false;
        return prepared;
    }

    #first = true; // Is it the first notification?
    get first() {
        return this.#first;
    }

    // This method should be overridden
    _notify() {
    }

    #processing = false;
    get processing() {
        return this.#processing;
    }

    #processed = false;
    get processed() {
        return this.#processed;
    }

    // This method should be overridden
    async _process(request) {
        void (request);
    }

    #tu;
    get tu() {
        return this.#tu;
    }

    #request;

    get _request() {
        return this.#request;
    }

    /**
     * Called by children when ready or upon a change in any of the children, or upon invalidation
     */
    #preprocess = () => {
        if (this.#destroyed) return;

        this.#processed = false;
        this.#processing = true;

        const prepared = this.__prepared;
        const changed = this.#children.update();
        if (changed) {
            // The processor became invalid while preparing, so call preprocess again
            // In this case __prepared is called again until all children is properly set
            this.#preprocess();
            return;
        }

        // If not prepared, the children is responsible to call #preprocess again when ready
        if (!prepared || !this.#children.prepared) return;

        const request = this.#request = autoincremental.request++;

        const performance = {
            now: Date.now(),
            check: () => {
                const ms = Date.now() - performance.now;
                ms > 2000 && this.#logs.append(`"${this.dp}" took ${ms} ms. to process`);
            }
        };

        /**
         * Once process is completed
         *
         * @param pr? {boolean | {changed: boolean, notify: boolean}} The process response
         */
        const done = (pr) => {
            if (this.#request !== request) return;

            pr = typeof pr === 'object' ? pr : {notify: pr, changed: pr};
            pr.notify = pr.notify === void 0 ? true : !!pr.notify;
            pr.changed = pr.changed === void 0 ? true : !!pr.changed;

            this.#tu = Date.now(); // The time updated
            performance.check();
            this.#processing = false;
            this.#processed = !this.#destroyed;

            const ready = this.#ready;
            this.#ready = void 0;
            ready?.resolve();

            const {changed, notify} = pr;
            (changed || this.#destroyed || this.#first) && this._events.emit('change', this);
            !this.#destroyed && notify && (!this.#first || this.notifyOnFirst) && this._notify();
            this.#first = false;
        }

        // The process response
        const pr = this._process(request);
        pr instanceof Promise ? pr.then(done).catch(exc => console.error(exc.stack)) : done(pr);
    }

    _invalidate = () => {
        this.#initialised && !this.#preparing && this.#preprocess();
    }

    #destroyed = false;
    get destroyed() {
        return this.#destroyed;
    }

    destroy() {
        if (this.#destroyed) throw new Error('Object is already destroyed');
        this.#request = Date.now();
        this.#children.destroy();
        this.#destroyed = true;
        registry.delete(this);

        this._events.emit('change', this);
    }
}
