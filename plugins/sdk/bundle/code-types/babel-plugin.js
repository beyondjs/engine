const t = require('@babel/types');

module.exports = () => () => ({
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

            /**
             * Modifier declare cannot be used in an already ambient context
             * @type {boolean}
             */
            node.declaration.declare = false;
            console.log(node);

            // if (t.isExportNamedDeclaration(node)) {
            //     node.declaration?.declarations.forEach(declaration => {
            //         const {name} = declaration.id;
            //         exports.add(name);
            //     });
            // }
            // else if (t.isExportDefaultDeclaration(node)) {
            //     const name = node.declaration.name;
            //     const declaration = t.variableDeclaration('const',
            //         [t.variableDeclarator(t.identifier('__default'), t.identifier(name))]);
            //     const replace = t.exportNamedDeclaration(declaration);
            //
            //     path.replaceWith(replace);
            //     exports.add('__default');
            // }
        }
    }
});
