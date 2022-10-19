const DynamicProcessor = global.utils.DynamicProcessor();
const {crc32} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'ts.dependencies.declarations.hash';
    }

    constructor(declarations) {
        super();
        super.setup(new Map([['declarations', {child: declarations}]]));
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

        const declarations = this.children.get('declarations').child;
        if (!declarations.valid) return done(0);

        const compute = {};
        declarations.forEach(({hash}, specifier) => compute[specifier] = hash);
        return done(Object.entries(compute).length ? crc32(JSON.stringify(compute)) : 0);
    }
}
