const Downloader = require('./downloader');
const {join} = require('path');
const registry = require('../registry');

module.exports = class {
    #path;
    #pkg;
    #version;

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    constructor(name) {
        if (!name) {
            this.#errors.push(`Package name must be specified`);
            return;
        }

        const {pkg, version, error} = (() => {
            const split = name.split('/');
            const scope = split[0].startsWith('@') ? split.shift() : void 0;
            if (!split.length) {
                return {error: `Package name "${name}" is invalid`};
            }

            const [pname, version] = split.shift().split('@');
            const pkg = (scope ? `${scope}/` : '') + pname;
            return {pkg, version};
        })();

        if (error) {
            this.#errors.push(error);
            return;
        }

        this.#pkg = pkg;
        this.#version = version;

        this.#path = join(process.cwd(), '.beyond/externals');
    }

    async install() {
        if (!this.valid) return;

        const pkg = this.#pkg;
        const {version, error} = await (async () => {
            if (this.#version) return this.#version;

            const registered = registry.obtain(pkg);
            await registered.fill();
            if (!registered.valid) return {error: `Error fetching "${pkg}" package: ${registered.error}`};

            return {version: registered.latest};
        })();

        const downloader = new Downloader(pkg, version, this.#path);
        await downloader.process();

        const installed = await (async () => {
            const installed = (require('../installed'));
            await installed.ready;
            return installed.get(`${pkg}@${version}`);
        })();

        // Do not move the import at the beginning of the file to avoid a circular dependency
        const {Tree: DependenciesTree, Config: DependenciesConfig} = require('beyond/dependencies');
        const config = new DependenciesConfig(installed.json);
        const tree = new DependenciesTree(config);

        await tree.fill();
        for (const dependency of tree.list.values()) {
            const {specifier, version} = dependency;
            const downloader = new Downloader(specifier, version, this.#path);
            await downloader.process();
        }
    }
}
