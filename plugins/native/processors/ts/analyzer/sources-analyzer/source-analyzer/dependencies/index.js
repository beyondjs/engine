const ts = require('typescript');
const tsKind = ts.SyntaxKind;
const Dependency = require('./dependency');

module.exports = class extends Array {
    #source;

    #visit = (node) => {
        const source = this.#source;

        const isIM = dependency => dependency.startsWith('.');

        // es6 dynamic import
        if (node.kind === tsKind.CallExpression && node.expression &&
            node.expression.kind === tsKind.ImportKeyword && node.arguments.length === 1 &&
            node.arguments[0].kind === tsKind.StringLiteral) {

            const specifier = node.arguments[0].text;
            !isIM(specifier) && this.push(new Dependency(specifier, 'dynamic.import', source, node.arguments[0]));
            return;
        }
        // es6 import
        else if ([tsKind.ImportDeclaration, tsKind.TSImportEqualsDeclaration].includes(node.kind) && node.moduleSpecifier) {
            // Excludes the internal modules
            const specifier = node.moduleSpecifier.text;
            if (isIM(specifier)) return;

            const is = specifier === 'beyond_context' ? 'internal.import' :
                (!node.importClause?.isTypeOnly ? 'import' : 'type');

            this.push(new Dependency(specifier, is, source, node.moduleSpecifier));
            return;
        }

        // Keep looking for dependencies
        ts.forEachChild(node, node => this.#visit(node));
    }

    constructor(source) {
        super();
        this.#source = source;
        ts.forEachChild(source, this.#visit);
    }
}
