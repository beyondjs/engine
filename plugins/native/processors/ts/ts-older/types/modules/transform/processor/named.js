const ts = require('typescript');

/**
 * Detect and transform an import of the form:
 * import {export1, export2} from "module-name";
 *
 * @param importName {string} The name of the variable assigned to the module being imported
 * @param node {object} The import node of the AST
 * @param factory {object} The factory of the transform function
 */
module.exports = function (importName, node, factory) {
    // Detect how the import is being assigned
    const clause = node.importClause;
    if (!clause) return;

    // import {x, y as z} from 'module';
    if (!clause.namedBindings || clause.namedBindings.kind !== ts.SyntaxKind.NamedImports) return;

    const transformed = [];
    for (const element of clause.namedBindings.elements) {
        const {name, propertyName} = element;

        // When propertyName is undefined => import {name} from ...
        // When propertyName is an Identifier => import {propertyName as name} from ...
        const nameEscapedText = name.escapedText;
        const propertyNameEscapedText = propertyName
            ? propertyName.escapedText
            : nameEscapedText;

        // Translated as:
        // import name = dependency_x.propertyName;
        // Where dependency_x is the name assigned to the import
        transformed.push(
            factory.createImportEqualsDeclaration(
                undefined,
                undefined,
                false, // from typescript 4.2.2
                factory.createIdentifier(nameEscapedText),
                factory.createQualifiedName(
                    factory.createIdentifier(importName),
                    factory.createIdentifier(propertyNameEscapedText)
                )
            )
        );
    }

    return transformed;
}
