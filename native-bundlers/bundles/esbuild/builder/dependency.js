module.exports = class {
    #subpath;
    get subpath() {
        return this.#subpath;
    }

    #pkg;
    get pkg() {
        return this.#pkg;
    }

    /**
     * Dependency constructor
     *
     * @param specifier {string} The specifier being imported
     * @param importer {string} The importer vpackage specifier
     * @param dependencies {Map<string, Package>} The package dependencies
     */
    constructor(specifier, importer, dependencies) {
        const split = specifier.split('/');
        const pkg = split[0].startsWith('@') ? `${split.shift()}/${split.shift()}` : split.shift();
        const subpath = split.join('/');

        this.#subpath = subpath ? `./${subpath}` : '.';

        const ip = dependencies.get(importer); // The importer package
        this.#vspecifier = `${pkg}@${ip.version}`;
        this.#pkg = ip.dependencies.get(this.#vspecifier);
    }
}
