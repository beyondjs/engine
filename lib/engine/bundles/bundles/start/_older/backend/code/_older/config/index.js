const DynamicProcessor = global.utils.DynamicProcessor();

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.start.config';
    }

    #distribution;

    #code;
    get code() {
        if (this.#code !== undefined) return this.#code;

        const application = this.children.get('application').child;
        if (!application.processed) throw new Error('Application is not ready. Wait for the .ready property before calling this property.');

        const libraries = this.children.get('libraries').child;
        const distribution = this.#distribution;

        let code = '';
        code += `const config = ${JSON.stringify({
            local: !distribution.build,
            environment: distribution.environment,
            amd: !!distribution.amd || distribution.platform !== 'web'
        })};\n`;

        code += `config.application = ${JSON.stringify(application.config)};\n`;
        code += 'beyond.setUp(config);\n\n';

        code += libraries.code;

        code = global.utils.code.scoped(code) + '\n\n';
        code = global.utils.code.header('APPLICATION CONFIGURATION') + code;

        return (this.#code = code);
    }

    constructor(application, distribution) {
        super();
        this.#distribution = distribution;

        const ports = new (require('./ports'))();

        const children = new Map();
        children.set('application', {child: new (require('./application'))(application, distribution, ports)});
        children.set('libraries', {child: new (require('./libraries'))(application.libraries, distribution, ports)})
        super.setup(children);
    }

    _process() {
        this.#code = undefined;
    }
}
