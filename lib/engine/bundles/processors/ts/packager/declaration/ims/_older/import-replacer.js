const t = require('@babel/types');

module.exports = function (im, ims, dependencies, specifier, type, imported, local) {
    const dependency = specifier.startsWith('.') ? void 0 : dependencies.get(specifier);

    const from = (() => {
        /**
         * It is a specifier of a dependency
         */
        if (!specifier.startsWith('.')) {
            return {
                default: t.Identifier(dependency.default.name),
                ns: t.Identifier(dependency.ns.name)
            };
        }

        /**
         * It is an internal module specifier
         */
        const resolved = ims.resolve(specifier, im.filename);
        if (!resolved) {
            const message = `Imported module "${specifier}" ` +
                `on internal module "${im.filename}" not found`
            throw new Error(message);
        }
        const identifier = t.Identifier(resolved.id);
        return {default: identifier, ns: identifier};
    })();

    const name = t.Identifier(local.name);

    if (type === 'ImportSpecifier') {
        const property = t.Identifier(imported ? imported.name : local.name);
    }
    else if (type === 'ImportDefaultSpecifier') {
        return t.tsImportEqualsDeclaration(name, from.default);
    }
    else if (type === 'ImportNamespaceSpecifier') {
        return t.tsImportEqualsDeclaration(name, from.ns);
    }

    return t.tsImportEqualsDeclaration(name, t.TSQualifiedName(from.ns, property));
}
