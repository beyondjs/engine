module.exports = class {
    #bundle;
    get bundle() {
        return this.#bundle;
    }

    #platform;
    get platform() {
        return this.#platform;
    }

    #js;
    get js() {
        return this.#js;
    }

    #css;
    get css() {
        return this.#css;
    }

    #types;
    get types() {
        return this.#types;
    }

    constructor(bundle, platform) {
        this.#bundle = bundle;
        this.#platform = platform;

        const {js, css} = (() => {
            const distribution = {platform, key: platform, bundles: {mode: 'esm'}};
            const packager = this.#bundle.packagers.get(distribution);
            return {js: packager.js, css: packager.css};
        })();
        this.#js = js;
        this.#css = css;

        this.#types = (() => {
            const distribution = {platform, key: platform, bundles: {mode: 'esm'}, ts: {compiler: 'tsc'}};
            const packager = this.#bundle.packagers.get(distribution);
            return packager.declaration;
        })();
    }
}
