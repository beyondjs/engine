const {NamespaceJS} = require('beyond/plugins/sdk');

module.exports = class extends Map {
    toJSON() {
        return [...this];
    }

    hydrate(cached) {
        cached.forEach(([key, value]) => {
            const output = new NamespaceJS();
            output.hydrate(value);
            this.set(key, output);
        });
    }
}
