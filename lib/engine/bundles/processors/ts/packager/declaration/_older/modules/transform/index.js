const ts = require('typescript');
const path = require('path');

module.exports = class {
    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    constructor(compiler, tsSources, sources) {
        const imports = new (require('./processor'))(compiler);
        this.#dependencies = imports.dependencies;

        // Get a list of the internal modules. Extract the extname from the name of the files
        const ims = new Set([...sources.keys()].map(filename => {
            const extname = path.extname(filename);
            return filename.slice(0, filename.length - extname.length);
        }));

        tsSources.forEach((source, module) => {
            const transform = require('./transform')(compiler, module, imports, ims);
            const transformed = ts.transform(source, [transform]);
            tsSources.set(module, transformed.transformed[0]);
        });
    }
}
