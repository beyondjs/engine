const entryPoint = require('./entry-point');

module.exports = class {
    // The plugin name
    get name() {
        return 'beyond-module';
    }

    #processors;
    #ims = new Map();

    constructor(processors) {
        this.#processors = processors;

        processors.forEach(({js}) =>
            js?.outputs.ims?.forEach(({specifier, code, map}) => this.#ims.set(specifier, {code, map})));
    }

    #resolve(args) {
        void this;
        if (args.kind === 'entry-point') {
            return {namespace: 'beyond:entry-point', path: '.'};
        }
        return {namespace: 'beyond:im', path: args.path};
    }

    #load(args) {
        if (args.namespace === 'beyond:entry-point') {
            const contents = entryPoint(this.#processors);
            return {contents};
        }
        if (args.namespace !== 'beyond:im') throw new Error('Unexpected error. Namespace "beyond:im" was expected');

        const im = this.#ims.get(args.path);
        if (!im) throw new Error(`Internal module "${args.path}" not found`);

        const {code} = im;
        return {contents: code};
    }

    setup = build => {
        build.onResolve({filter: /./}, args => this.#resolve(args));
        build.onLoad({filter: /./}, async args => await this.#load(args));
    }
}
