const DynamicProcessor = global.utils.DynamicProcessor(Map);
const {relative} = require('path');

/**
 * The map of paths (relative to working directory) of the imported libraries
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.libraries.paths';
    }

    constructor(libraries) {
        super();
        super.setup(new Map([['libraries', {child: libraries}]]));
    }

    _prepared(require) {
        const libraries = this.children.get('libraries').child;
        libraries.forEach(library => require(library));
    }

    _process() {
        const libraries = this.children.get('libraries').child;

        this.clear();
        const cwd = process.cwd();

        libraries.forEach(library => {
            if (library.legacy || !library.valid) return;
            const path = relative(cwd, library.path);
            if (path.startsWith('..')) return;

            this.set(path, library);
        });
    }
}
