const {EventEmitter} = require('events');
const instances = (require('./instances'));

const Nothing = class {
};

// noinspection JSPotentiallyInvalidUsageOfThis
module.exports = (Base = Nothing) => class extends Base {
    _events = new EventEmitter();
    on = (event, listener) => {
        // To find if a dynamic processor hasn't set the maxListeners correctly
        const count = this._events.listenerCount(event);
        const max = this._events.getMaxListeners();
        max === count && console.log(`Max. listeners (${max}) achieved on ${this.dp} - ${this.id}`);

        this._events.on(event, listener);
    };
    off = (event, listener) => this._events.off(event, listener);
    removeALlListeners = () => this._events.removeAllListeners();
    setMaxListeners = n => this._events.setMaxListeners(n);

    // ms to wait to process after invalidation
    waitToProcess = 0;

    #children;
    get children() {
        return this.#children;
    }

    /**
     * Dynamic processor setup
     *
     * @param children {Map<object, {events: string[]}>} A map of children properties
     * where the key is the child object and the value is the specification object
     */
    setup(children) {
        this.#children.register(children, false, true);
    }

    #initialising = false;
    get initialising() {
        return this.#initialising;
    }

    #initialised = false;
    get initialised() {
        return this.#initialised;
    }

    #destroyed = false;
    get destroyed() {
        return this.#destroyed;
    }

    // Is a property that is defined only when processing and before initialised
    #ready = Promise.pending();
    get ready() {
        if (this.#destroyed) throw new Error('Object is destroyed');

        // Auto initialise when the ready promise is requested
        !this.#initialised && !this.#initialising && this.initialise().catch(exc => console.error(exc.stack));

        return this.#ready ? this.#ready.value : Promise.resolve();
    }

    _pendings = new (require('./pendings'))(this);

    /**
     * Collection of consumers that are waiting for this processor to get processed
     */
    _consumers = new Set();

    constructor(...params) {
        super(...params);
        instances.register(this);
        this.#children = new (require('./children'))(this);
    }

    #waiting = false;
    get waiting() {
        return this.#waiting;
    }

    // Is the processor prepared to process?
    // If not prepared, the promise will be kept pending, and will be processed at the next invalidation.
    get __prepared() {
        this._pendings.clear();

        if (!this.#children.prepared) {
            this.#waiting = true;
            return false;
        }

        // Check if dynamic processor is processed, but also initialise it if it wasn't previously initialised
        const check = (dp, id) => {
            if (!dp.dp) throw new Error('Parameter is not a dynamic processor');
            !dp.initialised && !dp.initialising && dp.initialise();
            (!dp.initialised || !dp.processed) && this._pendings.register(dp, {id});
            return dp.processed;
        };

        const response = this._prepared(check);
        const prepared = response !== false && !this._pendings.size;
        this.#waiting = !prepared;

        return prepared;
    }

    // This method can be overridden
    _prepared() {
        return true;
    }

    #first = true; // Is it the first notification?
    get first() {
        return this.#first;
    }

    notifyOnFirst = false;

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

    // Process is called:
    // 1. on initialisation, after all children are initialised
    // 2. after an invalidation
    #process = () => {
        const request = this.#request = Date.now();
        if (this.#holders.size) return;

        this.#ready = this.#ready || Promise.pending();
        this.#processed = false;
        this.#processing = true;

        /**
         * Once process is completed
         *
         * @param pr? {boolean | {changed: boolean, notify: boolean}} The process response
         * @param exc? {Error}
         */
        const done = (pr, exc) => {
            pr = typeof pr === 'object' ? pr : {notify: pr, changed: pr};
            pr.notify = pr.notify === void 0 ? true : !!pr.notify;
            pr.changed = pr.changed === void 0 ? true : !!pr.changed;

            exc && console.error(exc.stack);

            this.#tu = Date.now(); // The time updated
            this.#processing = false;
            this.#processed = !this.#destroyed;

            const ready = this.#ready;
            this.#ready = void 0;
            ready?.resolve();

            const {changed, notify} = pr;
            changed && this.#initialised && this._events.emit('change', this);
            notify && (!this.#first || this.notifyOnFirst) && this._notify();
            this.#first = false;

            // Invalidate the consumers that are waiting for this processor to be ready
            this._consumers.forEach(consumer => consumer._invalidate());
            this._consumers.clear();
        }

        const process = () => {
            if (this.#destroyed) return done();
            if (!this.__prepared) return;

            const performance = {
                now: Date.now(),
                check: () => {
                    const ms = Date.now() - performance.now;
                    ms > 2000 && console.log(`"${this.dp}" took too long to process: ${ms}`);
                }
            };

            // The process response
            const pr = this._process(request);
            if (!(pr instanceof Promise)) {
                performance.check();
                return done(pr);
            }

            pr.then(processResponse => {
                if (this.#destroyed) return done();
                performance.check();
                this.#request === request && done(processResponse);
            }).catch(exc => done(true, exc));
        };
        process();
    }

    // Avoid to process while at least a holder is set
    #holders = new Set(['initialisation']);

    hold(reason) {
        this.#holders.add(reason);
    }

    release(reason) {
        if (!this.#holders.has(reason)) return;
        this.#holders.delete(reason);
    }

    async initialise() {
        if (this.#destroyed) throw new Error('Object is already destroyed');
        if (this.#initialising || this.#initialised) return;
        this.#initialising = true;

        // Initialise children and set a timer to check if one of them never initialised
        this._pendings.checkpoint.set();
        await this.#children.initialise().catch(exc => console.log(exc.stack));
        this._pendings.checkpoint.release();
        if (this.#destroyed) return;

        this.#holders.delete('initialisation');
        this.#process();

        this._pendings.checkpoint.set();
        this.ready.then(() => {
            this._pendings.checkpoint.release();
            this.#initialising = false;
            this.#initialised = true;
            this._events.emit('initialised', this);
        });
    }

    #timer;

    _invalidate() {
        if (!this.#initialised && !this.#initialising) return;

        this.#ready = this.#ready || Promise.pending();
        this.#processed = false;
        this.#processing = true;

        this._pendings.checkpoint.set();
        const done = () => this._pendings.checkpoint.release();
        this.#ready.value.then(done).catch(done);

        this.#timer && clearTimeout(this.#timer);
        if (this.#initialising) {
            this.#process();
        }
        else {
            this.#holders.add('waiting');
            this.#timer = setTimeout(() => {
                this.#holders.delete('waiting');
                this.#process();
            }, this.waitToProcess);
        }
    }

    destroy() {
        instances.delete(this);
        if (this.#destroyed) throw new Error('Object is already destroyed');
        this.#request = Date.now();
        this.#children.destroy();
        this.#destroyed = true;
    }
}
