const t = require('@babel/types');

/**
 * Babel plugin
 *
 * @param info {{default: string}} Collected information required by the builder. Actually the name of the
 * variable exported from the namespace as the default export
 * @return {function(): {visitor: *}}
 */
module.exports = (info) => () => ({
    visitor: {
        VariableDeclaration(path) {
            path.node.declare && (path.node.declare = false);
        },
        ImportDeclaration: function (path) {
            // const specifier = path.node.source.value;
            // const {specifiers: imports} = node;
            //
            // const values = dependencies.has(specifier) ? dependencies.get(specifier) : new Map();
            // this.set(specifier, values);
            //
            // imports?.forEach(({type, imported, local}) => {
            //     if (type === 'ImportSpecifier') {
            //         const specifiers = values.has('specifiers') ? values.get('specifiers') : [];
            //         values.set('specifiers', specifiers);
            //         specifiers.push(imported?.name === local.name ? local.name : `${imported.name} as ${local.name}`);
            //     }
            //     else if (type === 'ImportDefaultSpecifier') {
            //         values.set('default', local.name);
            //     }
            //     else if (type === 'ImportNamespaceSpecifier') {
            //         values.set('namespace', local.name);
            //     }
            // });
        },
        ExportDeclaration: function (path) {
            const {node} = path;

            console.log(node);

            /**
             * Modifier declare cannot be used in an already ambient context
             * @type {boolean}
             */
            node.declaration && (node.declaration.declare = false);

            if (t.isExportDefaultDeclaration(node)) {
                info.default = node.declaration.name;
                path.remove();
            }
        }
    }
});
