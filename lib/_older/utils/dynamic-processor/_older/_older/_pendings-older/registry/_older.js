module.exports = new class {
    /**
     * Inform the pendings of a dynamic processor after _prepare was executed
     *
     * @param dp {object} The dynamic processor being processed
     * @param pendings {Map<dp, {processor: object, id?: string}>} The dynamic processors that are pending to be processed
     */
    informPendings(dp, pendings) {
        if (!dp || !pendings) throw new Error('Invalid parameters');

        this.cleanPendings(dp);
        pendings && this.#pendings.set(dp, pendings);

        pendings?.forEach((specs, pending) => {
            if (this.#consumers.has(pending)) {
                this.#consumers.get(pending).add(dp);
            }
            else {
                const set = new Set();
                this.#consumers.set(pending, set);
                set.add(dp);
            }
        });
    }

    /**
     * Inform that the dynamic processor has been processed
     *
     * @param dp {object} The dynamic processor that has been processed
     */
    informProcessed(dp) {
        if (!this.#consumers.has(dp)) return;

        const dps = this.#consumers.get(dp);
        dps.forEach(dp => dp._invalidate());
    }
}
