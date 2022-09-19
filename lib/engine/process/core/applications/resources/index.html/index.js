const {fs} = global.utils;
const minify = require('html-minifier').minify;

module.exports = class {
    #application;

    constructor(application) {
        this.#application = application;
    }

    #promise;
    #source;
    #preprocessed = new Map();

    async source() {
        if (this.#source) return this.#source;
        if (this.#promise) return await this.#promise.value;
        this.#promise = Promise.pending();

        const application = this.#application;
        await application.ready;

        // If index.html file exists in the application path, then return it
        const index = require('path').join(application.path, 'index.html');

        const {engine} = application;
        const file = await fs.exists(index) ? index : require('path').join(__dirname, 'sources', `${engine}.html`);

        // If index.html does not exist in the application path, then return the index default
        this.#source = await fs.readFile(file, 'UTF8');

        this.#promise.resolve(this.#source);
        return this.#source;
    }

    async content(url, distribution) {
        const application = this.#application;

        await this.#application.ssr.ready(distribution);

        let html;
        const {key} = distribution;
        if (this.#preprocessed.has(key)) {
            html = this.#preprocessed.get(key);
        }
        else {
            const source = await this.source();
            html = await require('./process')(application, source, distribution);
            this.#preprocessed.set(key, html);
        }

        html = distribution.minify.html ? minify(html, {
            removeComments: true,
            removeAttributeQuotes: true
        }) : html;
        return {html};
    }
}
