const ts = require('typescript');
const {sep} = require('path');

/**
 * The declaration transform function of each module
 *
 * @param compiler {object}
 * @param module {string} The internal module being processed
 * @param imports {object}
 * @param ims {Map<string, object>} The internal modules
 * @returns {function(*=): *}
 */
module.exports = (compiler, module, imports, ims) => context => rootNode => {
    const {factory} = context;
    const Kind = ts.SyntaxKind;

    function visit(node) {
        if (node.kind === Kind.SourceFile) {
            return ts.visitEachChild(node, visit, context);
        }

        if (node.kind === Kind.ImportDeclaration) {
            return imports.add(module, node, factory);
        }

        // Namespaces cannot export with the default keyword,
        // so transform the default keyword of the classes and functions into a named _default export
        if ([Kind.ClassDeclaration, Kind.FunctionDeclaration].includes(node.kind) && !node.name &&
            node.modifiers.filter(modifier => modifier.kind === Kind.DefaultKeyword).length) {

            node.modifiers = node.modifiers.filter(modifier => modifier.kind !== Kind.DefaultKeyword);
            node.name = factory.createIdentifier('_default');
            return node;
        }

        // These are imports that the compiler generates and points to namespaces
        // These imports have to be changed from: import('./module').type to: ns_module.type
        // when the import refers to an internal module
        if (node.kind === Kind.ImportType) {
            const {dependencies} = imports;
            const dependency = node.argument.literal.text;

            const identifier = (() => {
                if (dependencies.has(dependency)) {
                    return dependencies.get(dependency);
                }

                const im = ((dependency, module) => {
                    const path = require('path');
                    module = path.resolve(module, '..'); // Remove the filename

                    let im = path.resolve(module, dependency);
                    // The resolve function resolves adding the path of the process.cwd, so remove it
                    // Remove also the root slash
                    return im.slice(process.cwd().length).slice(1);
                })(dependency, module);

                if (ims.has(im)) return require('../namespaces/name')(compiler, im);

                const index = `${im}${sep}index`;
                if (ims.has(index)) return require('../namespaces/name')(compiler, index);
            })();
            if (!identifier) return node;

            return factory.createTypeReferenceNode(
                factory.createQualifiedName(
                    factory.createIdentifier(identifier),
                    node.qualifier
                ), node.typeArguments
            );
        }

        // Remove the export declaration that is inside the namespace (im)
        if (node.kind === Kind.ExportDeclaration) return;

        return ts.visitEachChild(node, visit, context);
    }

    return ts.visitNode(rootNode, visit);
}
