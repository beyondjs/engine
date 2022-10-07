const DynamicProcessor = require('beyond/utils/dynamic-processor');
const ipc = require('beyond/utils/ipc');
const {File: FinderFile} = require('beyond/utils/finder');

/**
 * Module static resources in the package
 */
module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'package.module.static';
    }

    #module;

    constructor(pkg, module) {
        super();

        this.#module = module;
        const overwrites = new (require('./overwrites'))(pkg, module);
        const children = new Map();
        children.set('static', {child: module.static});
        children.set('overwrites', {child: overwrites});
        super.setup(children);
    }

    _process() {
        this.length = 0;
        const finder = this.children.get('static').child;

        let o = this.children.get('overwrites').child;
        const overwrites = {
            path: o.path,
            config: o.config ? new Map(Object.entries(o.config)) : new Map()
        };

        this.clear();
        finder.forEach(file => {
            const key = file.relative.file.replace(/\\/g, '/');
            const overwrite = !overwrites.config.has(key) ? undefined :
                new FinderFile(overwrites.path,
                    require('path').join(overwrites.path, overwrites.config.get(key)));

            this.set(key, {file: file, overwrite: overwrite});
        });
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'list/update',
            table: 'modules-static',
            filter: {module: this.#module.id}
        });
    }
}
