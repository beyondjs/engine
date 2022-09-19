const DynamicProcessor = global.utils.DynamicProcessor(Map);
const {FinderFile} = global.utils;
const {sep} = global.utils;

/**
 * Library static resources in the application
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.library.static';
    }

    constructor(application, library) {
        super();

        const overwrites = application.template.overwrites.get(`libraries/${library.name}/static`);
        super.setup(new Map([['static', {child: library.static}], ['overwrites', {child: overwrites}]]));
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
            let key = file.relative.file;
            key = sep !== '/' ? key.replace(/\\/g, '/') : key;

            const overwrite = !overwrites.config.has(key) ? undefined :
                new FinderFile(overwrites.path,
                    require('path').join(overwrites.path, overwrites.config.get(key)));

            this.set(key, {file: file, overwrite: overwrite});
        });
    }
}
