const {ProcessorIMOutput} = require('beyond/plugins/sdk');

module.exports = class extends Map {
    toJSON() {
        return [...this];
    }

    hydrate(cached) {
        cached.forEach(([key, value]) => {
            const output = new ProcessorIMOutput();
            output.hydrate(value);
            this.set(key, output);
        });
    }
}
