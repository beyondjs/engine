const ts = require('typescript');
const {factory} = ts;

module.exports = function (file, className, node, context) {
    'use strict';

    const module = file.substr(0, file.length - 3); // Remove extension

    // Collect information about the methods of the class
    const info = new Map();

    const transform = node => {
        if (ts.isConstructorDeclaration(node)) return node;
        if (ts.isPropertyDeclaration(node)) return null;
        if (!ts.isMethodDeclaration(node)) return node;

        // No information is currently being collected about the method other than its name
        const methodName = node.name.escapedText;
        info.set(methodName, {});

        // Set always the async modifier to the method
        node.modifiers = [factory.createModifier(ts.SyntaxKind.AsyncKeyword)];
        node.type = !node.type || (node.type.typeName && node.type.typeName.escapedText === 'Promise') ?
            node.type :
            factory.createTypeReferenceNode(
                factory.createIdentifier('Promise'),
                [node.type]
            );

        // Transform the body of the method as it now has to be the action call (this.execute(...))
        node.body = factory.createBlock(
            [factory.createReturnStatement(factory.createAwaitExpression(factory.createCallExpression(
                factory.createPropertyAccessExpression(
                    factory.createThis(),
                    factory.createIdentifier('execute')
                ),
                undefined,
                [
                    factory.createStringLiteral(`${module}//${className}//${methodName}`),
                    factory.createSpreadElement(factory.createIdentifier('arguments'))
                ]
            )))],
            true
        );

        return node;
    };

    const processed = ts.visitEachChild(node, transform, context);
    return {node: processed, info};
}
