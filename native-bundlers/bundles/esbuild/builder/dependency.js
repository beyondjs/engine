module.exports = class {
    #pkg;
    get pkg() {
        return this.#pkg;
    }

    get vspecifier() {
        return this.#pkg.vspecifier;
    }

    get namespace() {
        return `beyond:${this.vspecifier}`;
    }

    #subpath;
    get subpath() {
        return this.#subpath;
    }

    /**
     * Dependency constructor
     *
     * @param specifier {string} The non-relative specifier being imported
     * @param importer {{namespace: string, vspecifier: string, path: string}} The importer of the specifier
     * @param dependencies {Map<string, Package>} The package dependencies
     */
    constructor(specifier, importer, dependencies) {
        /**
         * The parsed specifier
         * @type {{subpath: string, pkg: string}}
         */
        const requiring = (() => {
            const split = specifier.split('/');
            const pkg = split[0].startsWith('@') ? `${split.shift()}/${split.shift()}` : split.shift();

            let subpath = split.join('/');
            subpath = subpath ? `./${subpath}` : '.';

            return {pkg, subpath};
        })();

        const ip = dependencies.get(importer.vspecifier); // The package from where the specifier is being imported
        this.#pkg = ip.dependencies.get(this.#vspecifier);
        this.#vspecifier = `${pkg}@${ip.version}`;
    }
}
