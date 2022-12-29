const t = require('@babel/types');

module.exports = function (im, ims, dependencies, specifier, type, imported, local) {
    const name = t.Identifier(local.name);

    /**
     * It is a specifier of a dependency
     */
    if (!specifier.startsWith('.')) {
        const dependency = specifier.startsWith('.') ? void 0 : dependencies.get(specifier);

        if (type === 'ImportSpecifier') {
            dependency.ns.consumers.add(im.filename);

            const ns = t.Identifier(dependency.ns.name);
            const property = t.Identifier(imported ? imported.name : local.name);
            return t.tsImportEqualsDeclaration(name, t.TSQualifiedName(ns, property));
        }
        else if (type === 'ImportDefaultSpecifier') {
            dependency.default.consumers.add(im.filename);

            const from = t.Identifier(dependency.default.name);
            return t.tsImportEqualsDeclaration(name, from);
        }
        else if (type === 'ImportNamespaceSpecifier') {
            dependency.ns.consumers.add(im.filename);

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
