const InternalModule = require('./im');
const {join, resolve} = require('path');

module.exports = class extends Map {
    constructor(files) {
        super();

        files.forEach(({declaration: code, declarationMap: map}, filename) => {
            const id = `ns_${this.size}`;
            const im = new InternalModule(id, filename, {code, map});
            this.set(filename, im);
        });
    }

    resolve(id, from) {
        const module = (resolve('/', from, '..', id)).slice(1);
        const extensions = ['ts', 'tsx'];

        let found;

        extensions.find(ext => {
            const filename = `${module}.${ext}`;
            return this.has(filename) ? !!(found = this.get(filename)) : false;
        });
        if (found) return found;

        extensions.find(ext => {
            const filename = join(module, `index.${ext}`);
            return this.has(filename) ? !!(found = this.get(filename)) : false;
        });
        if (found) return found;
    }
}
