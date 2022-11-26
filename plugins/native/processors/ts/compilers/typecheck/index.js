const {ProcessorCompiler} = require('beyond/plugins/sdk');
const executeProgram = require('./program');
const packages = require('beyond/packages');
const SpecifierParser = require('beyond/utils/specifier-parser');

module.exports = class extends ProcessorCompiler {
    get dp() {
        return 'ts.processorCompiler';
    }

    get hash() {
        return this.processor.hash;
    }

    #previous;
    get previous() {
        return this.#previous;
    }

    #dependencies = new Map();

    _prepared(require) {
        this.#dependencies.clear();
        const {dependencies} = this.processor;
        if (!require(dependencies) || !require(packages)) return false;

        const {platform} = this.processor.targetedExport;

        const recursive = dependencies => dependencies.forEach(({specifier, is}) => {
            if (!is.has('import')) return;

            const {valid, pkg: requiredPackageName, subpath} = new SpecifierParser(specifier);
            if (!valid) return;

            const pkg = (() => {
                const currentPackage = this.processor.pkg;
                if (currentPackage.name === requiredPackageName) return currentPackage;
            })();
            if (!require(pkg.exports)) return;

            if (!pkg.exports.has(subpath)) return;
            const packageExport = pkg.exports.get(subpath);
            const targetedExport = packageExport.getTargetedExport(platform);
            if (!targetedExport) return;

            const {types} = targetedExport;
            if (!require(types)) return false;
            this.#dependencies.set(specifier, types);
        });

        recursive(dependencies);
    }

    async _compile(request) {
        const dependencies = this.#dependencies;

        const promises = [];
        dependencies.forEach(({outputs}) => promises.push(outputs.ready));
        await Promise.all(promises);
        if (this.cancelled(request)) return;

        promises.length = 0;
        dependencies.forEach(({outputs}) => promises.push(outputs.build().ready));
        await Promise.all(promises);
        if (this.cancelled(request)) return;

        const {previous, ims, diagnostics} = await executeProgram(this, request);
        if (this.cancelled(request)) return;

        this.#previous = previous;
        return {ims, diagnostics};
    }
}
