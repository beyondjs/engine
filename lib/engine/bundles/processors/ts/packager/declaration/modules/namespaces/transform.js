const ts = require('typescript');

/**
 * The transformation function to wrap each module in its corresponding typescript namespace
 *
 * @param compiler {object}
 * @param module {string} The internal module path
 */
module.exports = (compiler, module) => context => rootNode => {
    const {factory} = context;
    const Kind = ts.SyntaxKind;

    const name = require('./name')(compiler, module);

    function visit(node) {
        if (node.kind === Kind.SourceFile) {
            return factory.createModuleDeclaration(
                undefined,
                [factory.createModifier(Kind.DeclareKeyword)],
                factory.createIdentifier(name),
                factory.createModuleBlock(ts.visitNodes(node.statements, visit, context)),
                ts.NodeFlags.Namespace
            );
        }

        // Remove 'declare' and 'export' modifiers
        // 'declare' modifiers cannot be used in an already ambient context
        // 'export' is not required as the real export is at the module level at the end of the declaration file
        if (node.kind === Kind.ExportAssignment) return;
        const filter = [Kind.DeclareKeyword, Kind.ExportKeyword];
        node.modifiers = node.modifiers?.filter(modifier => !filter.includes(modifier.kind));

        return node;
    }

    return ts.visitNode(rootNode, visit);
}
