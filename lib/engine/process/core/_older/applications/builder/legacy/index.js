/**
 * Application builder
 */
module.exports = class {
    #application;
    get application() {
        return this.#application;
    }

    #builds;
    get builds() {
        return this.#builds;
    }

    #processing = false;
    get processing() {
        return this.#processing;
    }

    emit(...params) {
        this.#application.builder.emit(...params);
    }

    constructor(application) {
        this.#application = application;
        this.#builds = new (require('./builds'))(this);
    }

    async build(distribution) {
        if (typeof distribution !== 'object')
            throw new Error('Invalid distribution specifications');
        if (!['web', 'android', 'ios'].includes(distribution.platform))
            throw new Error(`Platform is not specified or is invalid: "${distribution.platform}"`);
        if (!['development', 'production'].includes(distribution.environment))
            throw new Error(`Environment "${distribution.environment}" is invalid`);

        distribution = Object.assign({build: true}, distribution);

        const application = this.#application;
        await application.ready;
        const name = application.name ? `"${application.name}": ` : '';
        this.emit('message', `Building application ${name}"${application.path}"`);

        this.#processing = true;

        const processor = new (require('./processor.js'))(this, distribution);
        try {
            await processor.process();
            this.#processing = false;
            this.emit('completed');
            return {processed: true};
        }
        catch (exc) {
            console.error(exc.stack);
            this.#processing = false;
            const error = `Error building application: ${exc.message}`;
            errors.push(error);
            this.emit('error', error);
            return {processed: false};
        }
    }
}
