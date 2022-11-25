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

    _prepared(require) {
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
            console.log(`The types of "${specifier}"`, types);
        });

        recursive(dependencies);
    }

    async _compile(request) {
        const {dependencies} = this.processor;
        console.log('dependencies:', dependencies);

        const {previous, ims, diagnostics} = await executeProgram(this, request);
        if (this.cancelled(request)) return;

        this.#previous = previous;
        return {ims, diagnostics};
    }
}
