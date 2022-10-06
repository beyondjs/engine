const ts = require('typescript');
const tsKind = ts.SyntaxKind;

const push = (dependencies, specifier, is) => {
    if (!specifier) return;

    const set = dependencies.has(specifier) ? dependencies.get(specifier) : new Set();
    set.add(is);
    dependencies.set(specifier, set);
}

/**
 * Analyze if the AST node is a dependency
 */
const analyze = function (node, dependencies) {
    const isIM = dependency => dependency.startsWith('.');

    // es6 dynamic import
    if (node.kind === tsKind.CallExpression && node.expression &&
        node.expression.kind === tsKind.ImportKeyword && node.arguments.length === 1 &&
        node.arguments[0].kind === tsKind.StringLiteral) {

        const specifier = node.arguments[0].text;
        !isIM(specifier) && push(dependencies, specifier, 'dynamic.import');
        return;
    }
    // es6 import
    else if ([tsKind.ImportDeclaration, tsKind.TSImportEqualsDeclaration].includes(node.kind) && node.moduleSpecifier) {
        // Excludes the internal modules
        const specifier = node.moduleSpecifier.text;
        if (isIM(specifier)) return;

        const is = specifier === 'beyond_context' ? 'internal.import' :
            (!node.importClause?.isTypeOnly ? 'import' : 'type');

        push(dependencies, specifier, is);
        return;
    }

    // Keep looking for dependencies
    ts.forEachChild(node, node => analyze(node, dependencies));
}

module.exports = analyze;
