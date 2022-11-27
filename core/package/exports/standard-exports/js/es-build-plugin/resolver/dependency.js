/**
 * Resolves the vspecifier of the imported specifier according to the dependencies tree
 */
module.exports = class {
    #pkg;
    get pkg() {
        return this.#pkg;
    }

    #specifier;
    /**
     * The specifier being resolved
     * @return {string}
     */
    get specifier() {
        return this.#specifier;
    }

    #vspecifier;
    /**
     * The vspecifier that satisfies the dependencies tree
     * @return {*}
     */
    get vspecifier() {
        return this.#vspecifier;
    }

    get namespace() {
        return `beyond:${this.#vspecifier}`;
    }

    #subpath;
    /**
     * The subpath of the specifier being resolved
     * @return {*}
     */
    get subpath() {
        return this.#subpath;
    }

    /**
     * Dependency constructor
     *
     * @param plugin {*} The esbuild plugin that is processing the targetedExport
     * @param specifier {string} The non-relative specifier being imported
     * @param importer {{namespace: string, vspecifier: string, path: string}} The importer of the specifier
     */
    constructor(plugin, specifier, importer) {
        this.#specifier = specifier;

        /**
         * The parsed package name and subpath of the specifier being imported
         * @type {{subpath: string, pkg: string}}
         */
        const requiring = (() => {
            const split = specifier.split('/');
            const pkg = split[0].startsWith('@') ? `${split.shift()}/${split.shift()}` : split.shift();

            let subpath = split.join('/');
            subpath = subpath ? `./${subpath}` : '.';

            return {pkg, subpath};
        })();
        this.#subpath = requiring.subpath;

        /**
         * Check if it is a self package specifier
         */
        if (requiring.pkg === plugin.pkg.name) {
            this.#vspecifier = plugin.pkg.vname;
            return;
        }

        /**
         * Get the version of the package of the specifier being required according to the dependencies tree
         */
        const version = (() => {
            const dependencies = importer.vspecifier === plugin.pkg.vname ?
                plugin.pkg.dependencies :
                plugin.pkg.dependencies.list.get(importer.vspecifier);

            /**
             * Get the list of dependencies of the package from where the specifier is being imported
             * The property dependencies.list is the complete list of vspecifiers that are used across the dependencies tree
             * @type Map<string, {version, dependencies}>
             */
            const {version} = dependencies.get(requiring.pkg);
            return version;
        })();
        this.#vspecifier = `${requiring.pkg}@${version}`;
    }
}
