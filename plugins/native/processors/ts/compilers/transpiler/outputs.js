const Output = require('./output');

module.exports = class extends Map {
    toJSON() {
        return [...this];
    }

    hydrate(cached) {
        cached.forEach(([key, value]) => {
            const output = new Output();
            output.hydrate(value);
            this.set(key, output);
        });
    }
}
