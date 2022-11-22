/**
 * Detect and transform an import of the form:
 * import default from "im";
 *
 * @param importName {string} The name of the variable assigned to the module being imported
 * @param node {object} The import node of the AST
 * @param factory {object} The factory of the transform function
 */
module.exports = function (importName, node, factory) {
    // Detect how the import is being assigned
    const clause = node.importClause;
    if (!clause?.name) return;

    // import name from 'module' translated as: defaultExport = dependency_x;
    // Where dependency_x is the name assigned to the import
    return factory.createImportEqualsDeclaration(undefined, undefined, false,
        factory.createIdentifier(clause.name.escapedText),
        factory.createQualifiedName(factory.createIdentifier(importName), factory.createIdentifier('_default'))
    );
}
