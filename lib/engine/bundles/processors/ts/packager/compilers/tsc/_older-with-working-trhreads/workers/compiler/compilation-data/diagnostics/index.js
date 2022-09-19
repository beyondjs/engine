const Diagnostic = require('../../../../../diagnostic');

module.exports = class {
    #general = [];
    get general() {
        return this.#general;
    }

    #files = new Map();
    get files() {
        return this.#files;
    }

    #dependencies = new Map();
    get dependencies() {
        return this.#dependencies;
    }

    process(diagnostics) {
        const is = file => require('path').isAbsolute(file) ? 'source' : 'dependency';

        for (let diagnostic of diagnostics) {
            diagnostic = new Diagnostic(diagnostic);

            // If file is not set, add the diagnostic to the general diagnostics
            if (!diagnostic.file) {
                this.#general.push(diagnostic.message);
                continue;
            }

            const file = typeof diagnostic.file === 'string' ? diagnostic.file : diagnostic.file.fileName;
            const add = (map) => {
                const diagnostics = map.has(file) ? map.get(file) : [];
                diagnostics.push(diagnostic);
                map.set(file, diagnostics);
            }

            switch (is(file)) {
                case 'source':
                    add(this.#files);
                    break;
                case 'dependency':
                    add(this.#dependencies)
                    break;
            }
        }
    }

    toJSON() {
        return {
            general: this.#general,
            files: [...this.#files.entries()],
            dependencies: [...this.#dependencies.entries()]
        }
    }
}
