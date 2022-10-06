/**
 * A dependency of a sass processor is a files collection of another processor of another bundle
 */
module.exports = class {
    #application;
    #bundle;
    get bundle() {
        return this.#bundle;
    }

    #error;
    get error() {
        return this.#error
    }

    #files;
    get files() {
        return this.#files;
    }

    constructor(application, bundle) {
        this.#application = application;
        this.#bundle = bundle;
    }

    async process() {
        const application = this.#application;

        const {bundles} = application.modules;
        await bundles.ready;
        if (!bundles(this.#bundle)) {
            this.#error = `Bundle "${this.#bundle}" not found`;
            return;
        }

        const bundle = bundles.get(this.#bundle);
        await bundle.ready;
        const packager = bundle.packagers.get({key: 'internal:sass'});
        await packager.processors.ready;

        if (!packager.processors.has('sass')) {
            this.#error = `Bundle "${this.#bundle}" does not implement a "sass" processor`;
            return;
        }
        const processor = packager.processors.get('sass');
        await processor.files.ready;

        this.#files = processor.files;
    }
}
