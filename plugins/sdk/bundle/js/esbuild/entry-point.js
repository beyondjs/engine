module.exports = function (processors) {
    let code = '';
    const exports = new Map();

    function processIM({specifier}) {
        const vars = (() => {
            if (!exports.has(specifier)) return '';
            const vars = [...exports.get(specifier)].map(([from, name]) => {
                return name === from ? name : `${from} as ${name}`;
            });
            return vars.join(',');
        })();

        code += vars ?
            `export {${vars}} from '${specifier}'\n` :
            `import from '${specifier}';\n`;
    }

    /**
     * Process the exports
     */
    processors.forEach(({js}) => js?.exports?.forEach(bundleExport => {
        const {imSpecifier, name, from} = bundleExport;

        const imExports = exports.has(imSpecifier) ? exports.get(imSpecifier) : new Map();
        exports.set(imSpecifier, imExports);
        imExports.set(from, name);
    }));

    /**
     * Process the IMs
     */
    processors.forEach(({js}) => js?.outputs.ims?.forEach(im => processIM(im)));

    return code;
}