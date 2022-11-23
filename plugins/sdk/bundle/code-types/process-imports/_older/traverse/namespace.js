const ts = require('typescript');
/**
 * Detect and transform internal namespaces imports (an import of the form):
 * import * as name from "internal_module";
 *
 * @param importName {string} The name of the variable assigned to the module being imported
 * @param node {object} The import node of the AST
 * @param factory {object} The factory of the transform function
 */
module.exports = function (importName, node, factory) {
    // Detect how the import is being assigned
    const clause = node.importClause;
    if (!clause) return;

    // import * as name from 'module';
    if (!clause.namedBindings || clause.namedBindings.kind !== ts.SyntaxKind.NamespaceImport) return;

    // Translated as:
    // import name = dependency_x;
    // Where dependency_x is the name assigned to the import
    const nameEscapedText = clause.namedBindings.name.escapedText;

    return factory.createImportEqualsDeclaration(
        undefined,
        undefined,
        false,
        factory.createIdentifier(nameEscapedText),
        factory.createIdentifier(importName)
    )
}
