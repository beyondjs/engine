module.exports = class PendingPromise extends Promise {
    resolve;
    reject;

    constructor(executor) {
        // needed for PendingPromise.race/all ecc
        if (executor instanceof Function) {
            super(executor);
            return;
        }

        let resolve = void 0;
        let reject = void 0;
        super((a, b) => {
            resolve = a;
            reject = b;
        });
        this.resolve = resolve;
        this.reject = reject;
    }
}
