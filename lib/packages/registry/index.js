const Package = require('./package.js');

module.exports = new class extends Map {
    obtain(name) {
        if (this.has(name)) return this.get(name);

        const pkg = new Package(name);
        this.set(name, pkg);
        return pkg;
    }
}
