const DynamicProcessor = global.utils.DynamicProcessor();

/**
 * Processes the external libraries ('react', 'react-dom', 'react-transition-group', etc)
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.start.externals';
    }

    #distribution;

    constructor(application, distribution) {
        super();
        this.#distribution = distribution;
        super.setup(new Map([['externals', {child: application.externals}]]));
    }

    #code;
    get code() {
        if (this.#distribution.ssr && this.#distribution.server) return;

        if (this.#code !== undefined) return this.#code;

        const {platform} = this.#distribution;
        const baseUrl = ['web', 'ssr'].includes(platform) ? '/' : '';

        const externals = {};
        this.children.get('externals').child.forEach(({package: pkg}) => externals[pkg] = `packages/${pkg}`);

        const code = (`requirejs.config({\n` +
            `  baseUrl: '${baseUrl}',\n` +
            `  paths: ` + JSON.stringify(externals, null, 2) +
            `});\n\n`);

        return (this.#code = code);
    }


    _process() {
        this.#code = undefined;
    }
}
