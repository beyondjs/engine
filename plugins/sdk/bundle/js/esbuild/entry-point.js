module.exports = function (processors) {
    /**
     * Process the exports
     */
    const exports = new Map();
    processors.forEach(({js}) => js?.exports?.forEach(bundleExport => {
        const {imSpecifier, kind, name, from} = bundleExport;
        if (kind !== 'export') return;

        const imExports = exports.has(imSpecifier) ? exports.get(imSpecifier) : new Map();
        exports.set(imSpecifier, imExports);
        imExports.set(from, name);
    }));

    function processIM({specifier}) {
        const vars = (() => {
            if (!exports.has(specifier)) return '';

            const vars = [...exports.get(specifier)].map(([from, name]) => {
                return name === from ? name : `${from} as ${name}`;
            });
            return vars.join(',');
        })();

        vars ? (reexports += `export {${vars}} from '${specifier}'\n`) :
            (imports += `import '${specifier}';\n`);
    }

    /**
     * Process the IMs
     */
    let reexports = '', imports = '';
    processors.forEach(({js}) => js?.outputs.ims?.forEach(im => processIM(im)));

    /**
     * Actually only processing the bundle exports.
     * Multi-entry option could be added to execute all inputs.
     * @type {boolean}
     */
    const multientry = false;
    return multientry ? reexports + imports : reexports;
}
