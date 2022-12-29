const t = require('@babel/types');

module.exports = function (im, ims, dependencies, specifier, type, imported, local) {
    const dependency = specifier.startsWith('.') ? void 0 : dependencies.get(specifier);
    const name = t.Identifier(local.name);

    /**
     * It is a specifier of a dependency
     */
    if (!specifier.startsWith('.')) {
        if (type === 'ImportSpecifier') {
            const ns = t.Identifier(dependency.ns.name);
            const property = t.Identifier(imported ? imported.name : local.name);
            return t.tsImportEqualsDeclaration(name, t.TSQualifiedName(ns, property));
        }
        else if (type === 'ImportDefaultSpecifier') {
            const from = t.Identifier(dependency.default.name);
            return t.tsImportEqualsDeclaration(name, from);
        }
        else if (type === 'ImportNamespaceSpecifier') {
            const ns = t.Identifier(dependency.ns.name);
            return t.tsImportEqualsDeclaration(name, ns);
        }
    }
    /**
     * It is an internal module import
     */
    else {
        const resolved = ims.resolve(specifier, im.filename);
        if (!resolved) {
            const message = `Imported module "${specifier}" ` +
                `on internal module "${im.filename}" not found`
            throw new Error(message);
        }

        const identifier = t.Identifier(resolved.id);

        if (type === 'ImportSpecifier') {
            const property = t.Identifier(imported ? imported.name : local.name);
            return t.tsImportEqualsDeclaration(name, t.TSQualifiedName(identifier, property));
        }
        else if (type === 'ImportDefaultSpecifier') {
            const property = t.Identifier('_default');
            return t.tsImportEqualsDeclaration(name, t.TSQualifiedName(identifier, property));
        }
        else if (type === 'ImportNamespaceSpecifier') {
            return t.tsImportEqualsDeclaration(name, identifier);
        }
    }
}
