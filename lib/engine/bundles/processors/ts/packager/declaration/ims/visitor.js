const t = require('@babel/types');
const importReplacer = require('./import-replacer');

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
        VariableDeclaration(path) {
            path.node.declare && (path.node.declare = false);
        },
        ImportDeclaration: function (path) {
            const specifier = path.node.source.value;

            const replacement = [];
            // Iterate the import specifiers (namespace, default, named values)
            path.node.specifiers?.forEach(({type, imported, local}) => {
                replacement.push(importReplacer(im, ims, dependencies, specifier, type, imported, local));
            });
            replacement.length ? path.replaceWithMultiple(replacement) : path.remove();
        },
        ExportDeclaration: function (path) {
            const {node} = path;

            /**
             * Modifier declare cannot be used in an already ambient context
             * @type {boolean}
             */
            node.declaration && (node.declaration.declare = false);

            if (t.isExportDefaultDeclaration(node)) {
                im.data.default = node.declaration.name;
            }
        }
    }
});
