const ts = require('typescript');
const {factory, SyntaxKind: tsKind} = ts;
const printer = ts.createPrinter();

module.exports = class {
    #file;
    get file() {
        return this.#file;
    }

    #valid = false;
    get valid() {
        return this.#valid;
    }

    #code;
    get code() {
        return this.#code;
    }

    #data = new Map();
    get data() {
        return this.#data;
    }

    constructor(file, ast) {
        this.#file = file;

        // Traverse AST
        let found = false;
        const traverse = context => root => {
            const analyze = node => {
                if (node.kind === ts.SyntaxKind.SourceFile) return ts.visitEachChild(node, analyze, context);

                // Check if node has the 'export' modifier
                if (!ts.isClassDeclaration(node) || !node.modifiers ||
                    !node.modifiers.find(modifier => modifier.kind === tsKind.ExportKeyword)) {

                    return node.kind === tsKind.InterfaceDeclaration ? node : null;
                }

                // Check if node specifies that it is an actions class
                const check = node => {
                    const text = ast.text.substr(node.getStart(ast), 20);
                    return /\/\*(\s*)actions(\s*)\*\//.test(text);
                };

                if (!node.name || !check(node)) return null;
                const className = node.name.escapedText;
                if (!className) return null;

                found = true;

                const heritage = factory.createHeritageClause(
                    ts.SyntaxKind.ExtendsKeyword,
                    [factory.createExpressionWithTypeArguments(
                        factory.createIdentifier('ActionsBridge'),
                        undefined
                    )]
                );

                node = factory.updateClassDeclaration(node, node.decorators, node.modifiers,
                    node.name, node.typeParameters, factory.createNodeArray([heritage]), node.members);

                // Remove constructor
                node.members = node.members.filter(member => !ts.isConstructorDeclaration(member));

                const constructor = factory.createConstructorDeclaration(
                    undefined,
                    undefined,
                    [],
                    factory.createBlock(
                        [factory.createExpressionStatement(factory.createCallExpression(
                            factory.createSuper(),
                            undefined,
                            [
                                factory.createStringLiteral(cspecs.backend ? cspecs.backend : 'unknown'),
                                factory.createIdentifier('bundle')
                            ]
                        ))],
                        true
                    )
                );

                node.members.push(constructor);

                // At this point, the node is a BeyondJS actions class
                const parsed = require('./methods')(file, className, node, context);
                this.#data.set(className, parsed.info);
                return parsed.node;
            }

            return ts.visitNode(root, analyze, context);
        };

        const result = ts.transform(ast, [traverse]);
        if (!found) return {};

        this.#valid = true;
        this.#code =
            `import {bundle} from 'beyond_context';\n` +
            `declare const ActionsBridge: any;\n` +
            printer.printFile(result.transformed[0]);
    }
}
