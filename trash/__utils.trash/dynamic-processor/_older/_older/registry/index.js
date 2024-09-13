/**
 * All the active processors
 */
module.exports = new class extends Map {
    register(dp) {
        const entry = new (require('./entry'))(dp);
        this.#registry.add(dp, entry);
    }

    delete(dp) {
        this.#registry.delete(dp);
    }

    getConsumersOfDP(dp) {
        if (!this.has(dp)) {
            console.trace('A pending DP was not found in the processors registry. Has it been destroyed?');
            return;
        }
        return this.get(dp).consumers;
    }
}
