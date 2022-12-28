const t = require('@babel/types');

/**
 * Babel plugin
 *
 * @param output {*} Output values
 * @return {function(): {visitor: *}}
 */
module.exports = (output) => () => ({
    visitor: {
        VariableDeclaration(path) {
            path.node.declare && (path.node.declare = false);
        },
        ImportDeclaration: function (path) {
            const specifier = path.node.source.value;
            const {specifiers: imports} = path.node;

            const replacement = [];
            const dependency = (() => {
                output.dependencies = output.dependencies ? output.dependencies : new Map();
                const {dependencies} = output;

                const values = dependencies.has(specifier) ? dependencies.get(specifier) : new Map();
                dependencies.set(specifier, values);
                return values;
            })();

            imports?.forEach(({type, imported, local}) => {
                if (type === 'ImportSpecifier') {
                    const specifiers = dependency.has('named') ? dependency.get('named') : [];
                    dependency.set('named', specifiers);
                    specifiers.push(imported?.name === local.name ? local.name : `${imported.name} as ${local.name}`);

                    const sentence = (() => {
                        const name = t.Identifier(local.name);
                        const from = t.TSQualifiedName(t.Identifier('ns_0'), t.Identifier('hello'));
                        return t.tsImportEqualsDeclaration(name, from);
                    })();
                    replacement.push(sentence);
                }
                else if (type === 'ImportDefaultSpecifier') {
                    dependency.set('default', local.name);
                }
                else if (type === 'ImportNamespaceSpecifier') {
                    dependency.set('namespace', local.name);
                }
            });

            replacement.length && console.log(replacement);
            replacement.length && path.replaceWithMultiple(replacement);
        },
        ExportDeclaration: function (path) {
            const {node} = path;

            /**
             * Modifier declare cannot be used in an already ambient context
             * @type {boolean}
             */
            node.declaration && (node.declaration.declare = false);

            if (t.isExportDefaultDeclaration(node)) {
                output.default = node.declaration.name;
                path.remove();
            }
        }
    }
});
