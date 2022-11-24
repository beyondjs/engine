/**
 * Babel transform plugin
 * @param metadata {{exports: Set<string>, dependencies: Map<string, *>}}
 * @return {function(): {visitor: {ImportDeclaration: function(*): void, ExportDeclaration: function(*): void}}}
 */
module.exports = (metadata) => () => ({
    visitor: {
        ImportDeclaration: function (path) {
            const {dependencies} = metadata;
            const specifier = path.node.source.value;
            const {specifiers: imports} = path.node;

            const values = dependencies.has(specifier) ? dependencies.get(specifier) : new Map();
            this.set(specifier, values);

            imports?.forEach(({type, imported, local}) => {
                if (type === 'ImportSpecifier') {
                    const specifiers = values.has('specifiers') ? values.get('specifiers') : [];
                    values.set('specifiers', specifiers);
                    specifiers.push(imported?.name === local.name ? local.name : `${imported.name} as ${local.name}`);
                }
                else if (type === 'ImportDefaultSpecifier') {
                    values.set('default', local.name);
                }
                else if (type === 'ImportNamespaceSpecifier') {
                    values.set('namespace', local.name);
                }
            });
        },
        ExportDeclaration: function (path) {
            const {exports} = metadata;

            /**
             * Modifier declare cannot be used in an already ambient context
             * @type {boolean}
             */
            path.node.declaration.declare = false;

            const {declarations} = path.node.declaration;
            declarations.forEach(declaration => {
                const {name} = declaration.id;
                exports.add(name);
            });
        }
    }
});
