const DynamicProcessor = global.utils.DynamicProcessor();
const {crc32} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'sass.dependencies.files.hash';
    }

    constructor(files) {
        super();
        super.setup(new Map([['dependencies.files', {child: files}]]));
    }

    #value;
    get value() {
        return this.#value;
    }

    _process() {
        const done = value => {
            const changed = value !== this.#value;
            this.#value = value;
            return changed;
        }

        const dfiles = this.children.get('dependencies.files').child;
        if (!dfiles.valid) return done(0);

        const compute = {};
        dfiles.forEach((files, resource) => compute[resource] = files.hash);
        return done(Object.entries(compute).length ? crc32(JSON.stringify(compute)) : 0);
    }
}
