const DynamicProcessor = global.utils.DynamicProcessor(Map);
const {FinderFile} = global.utils;
const {sep} = global.utils;

/**
 * The static resources of the imported project
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.imported.static';
    }

    #al;

    /**
     * Imported project static resources collection constructor
     *
     * @param al {object} The application library
     */
    constructor(al) {
        super();
        this.#al = al;
        super.setup(new Map([['al', {child: al}]]));
    }

    _prepared() {
        const {children} = this;
        const _static = this.#al.library?.static;

        if (children.has('static')) {
            if (children.get('static').child === _static) return;
            children.unregister(['static']);
            children.unregister(['overwrites']);
        }
        if (!_static) return;

        const {template} = this.#al.application;
        const overwrites = template.overwrites.get(`libraries/${this.#al.package}/static`);

        children.register(new Map([
            ['static', {child: _static}],
            ['overwrites', {child: overwrites}]
        ]));
    }

    _process() {
        const {children} = this;
        const _static = children.has('static') ? children.get('static').child : void 0;
        const o = children.has('overwrites') ? children.get('overwrites').child : void 0;

        const overwrites = o ? {
            path: o.path,
            config: o.config ? new Map(Object.entries(o.config)) : new Map()
        } : void 0;

        this.length = 0;
        const updated = new Map();
        _static?.forEach(file => {
            let key = file.relative.file;
            key = sep !== '/' ? key.replace(/\\/g, '/') : key;

            const overwrite = !overwrites.config.has(key) ? undefined :
                new FinderFile(overwrites.path,
                    require('path').join(overwrites.path, overwrites.config.get(key)));

            updated.set(key, {file: file, overwrite: overwrite});
        });

        super.clear();
        updated.forEach((value, key) => this.set(key, value));
    }
}
