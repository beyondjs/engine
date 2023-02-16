const t = require('@babel/types');

module.exports = new class {
    import(im, ims, dependencies, specifier, node) {
        const {type, imported, local} = node;

        const name = t.Identifier(local.name);

        /**
         * It is a specifier of a dependency
         */
        if (!specifier.startsWith('.')) {
            const dependency = dependencies.get(specifier);

            if (type === 'ImportSpecifier') {
                dependency.ns.consumers.add(im.filename);

                const ns = t.Identifier(dependency.ns.name);
                const property = t.Identifier(imported ? imported.name : local.name);
                return t.tsImportEqualsDeclaration(name, t.TSQualifiedName(ns, property));
            }
            else if (type === 'ImportDefaultSpecifier') {
                dependency.def.consumers.add(im.filename);

                const from = t.Identifier(dependency.def.name);
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

    /**
     * These are imports that the compiler generates and points to internal modules or dependencies
     * These imports have to be changed:
     * from: import('./im').type to: ns_id.property
     * from: import('specifier').type to: dependency_ns.property
     */
    importType(im, ims, dependencies, node) {
        const {argument, qualifier} = node;
        const specifier = argument.value;

        const left = (() => {
            /**
             * It is an internal module import
             */
            if (specifier.startsWith('.')) {
                const resolved = ims.resolve(specifier, im.filename);
                if (!resolved) {
                    const message = `Imported module "${specifier}" ` +
                        `on internal module "${im.filename}" not found`
                    throw new Error(message);
                }
                return t.Identifier(resolved.id);
            }
            /**
             * It is a specifier of a dependency
             */
            else {
                const dependency = dependencies.get(specifier);
                dependency.ns.consumers.add(im.filename);
                return t.Identifier(dependency.ns.name);
            }
        })();

        const typeName = qualifier.type === 'TSQualifiedName' ?
            t.TSQualifiedName(t.TSQualifiedName(left, qualifier.left), qualifier.right) :
            t.Identifier(qualifier.name);

        return t.TSTypeReference(typeName);
    }
}
