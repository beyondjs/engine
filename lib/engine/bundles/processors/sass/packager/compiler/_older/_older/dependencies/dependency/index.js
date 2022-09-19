/**
 * A dependency of a sass processor is a files collection of another processor of another bundle
 */
module.exports = class {
    #application;
    #bundle;
    get bundle() {
        return this.#bundle;
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
        const split = this.#bundle.split('/');
        const bname = split.pop();
        const mresource = split.join('/');

        await application.modules.ready;
        if (!application.modules.resources.has(mresource)) {
            throw new Error(`Module "${mresource}" not found`);
        }

        const module = application.modules.resources.get(mresource);
        await module.ready;

        if (!module.bundles.has(bname)) {
            throw new Error(`Bundle "${bname}" not found on module "${mresource}"`);
        }

        const bundle = module.bundles.get(bname);
        await bundle.ready;
        const bpackager = bundle.packagers.get({key: 'internal:sass'});
        await bpackager.processors.ready;

        if (!bpackager.processors.has('sass')) {
            throw new Error(`Bundle "${bname}" on module "${mresource}" does not implement a "sass" processor`);
        }
        const processor = bpackager.processors.get('sass');
        await processor.files.ready;

        this.#files = processor.files;
    }
}
