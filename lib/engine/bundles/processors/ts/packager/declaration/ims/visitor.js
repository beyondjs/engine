const t = require('@babel/types');
const replace = (require('./replace'));

/**
 * Babel plugin
 *
 * @param im {*} The internal module being processed
 * @param ims {Map<string, *>}
 * @param dependencies {Map<string, *>}
 * @return {function(): {visitor: *}}
 */
module.exports = (im, ims, dependencies) => () => ({
    visitor: {
        Declaration(path) {
            path.node.declare && (path.node.declare = false);
        },
        ImportDeclaration: function (path) {
            const specifier = path.node.source.value;

            const replacement = [];
            // Iterate the import specifiers (namespace, default, named values)
            path.node.specifiers?.forEach(
                node => replacement.push(replace.import(im, ims, dependencies, specifier, node)));
            replacement.length ? path.replaceWithMultiple(replacement) : path.remove();
        },
        /**
         * These are imports that the compiler generates and points to internal modules or dependencies
         * These imports have to be changed:
         * from: import('./im').type to: ns_id.property
         * from: import('specifier').type to: dependency_ns.property
         * @param path
         * @constructor
         */
        TSImportType: function (path) {
            path.replaceWith(replace.importType(im, ims, dependencies, path.node));
        },
        ExportDeclaration: function (path) {
            const {node} = path;

            /**
             * Modifier declare cannot be used in an already ambient context
             * @type {boolean}
             */
            node.declaration && (node.declaration.declare = false);

            if (t.isExportDefaultDeclaration(node)) {
                /**
                 * export default _variable
                 */
                if (node.declaration.type === 'Identifier') {
                    const local = t.Identifier(node.declaration.name);
                    const specifier = t.exportSpecifier(local, local);
                    const replacement = t.exportNamedDeclaration(null, [specifier]);
                    path.replaceWith(replacement);
                }
                /**
                 * export default class ClassName {}
                 */
                else {
                    node.declaration.id = t.Identifier('_default');
                    const replacement = t.exportNamedDeclaration(node.declaration);
                    path.replaceWith(replacement);
                }
            }
        }
    }
});
