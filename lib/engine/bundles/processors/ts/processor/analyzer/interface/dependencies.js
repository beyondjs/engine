const ts = require('typescript');
const tsKind = ts.SyntaxKind;

const push = (dependencies, specifier, props) => {
	if (!specifier) return;

	const is = (() => {
		const is = dependencies.has(specifier) ? dependencies.get(specifier).is : new Set();
		is.add(props.is);
		return is;
	})();

	dependencies.set(specifier, { is });
};

/**
 * Analyze if the AST node is a dependency
 */
const analyze = function (node, dependencies) {
	const isIM = dependency => dependency.startsWith('.');

	// es6 dynamic import
	if (
		node.kind === tsKind.CallExpression &&
		node.expression &&
		node.expression.kind === tsKind.ImportKeyword &&
		node.arguments.length === 1 &&
		node.arguments[0].kind === tsKind.StringLiteral
	) {
		const specifier = node.arguments[0].text;
		!isIM(specifier) && push(dependencies, specifier, { is: 'dynamic.import' });
		return;
	}
	// es6 import
	else if ([tsKind.ImportDeclaration, tsKind.TSImportEqualsDeclaration].includes(node.kind) && node.moduleSpecifier) {
		// Excludes the internal modules
		const specifier = node.moduleSpecifier.text;
		if (isIM(specifier)) return;

		const properties = (() => {
			if (node.importClause === undefined) {
				console.log('specifier  ', specifier);
			}
			const name = node.importClause.name?.escapedText;

			const bindings = node.importClause.namedBindings;
			if (!bindings) return { name };

			if (bindings.kind === tsKind.NamespaceImport) {
				return { default: name, namespace: bindings.name.escapedText };
			} else if (bindings.kind === tsKind.NamedImports) {
				const named = {};
				bindings.elements.forEach(({ name, propertyName: property }) => {
					property = property ? property : name;
					named[property.escapedText] = name.escapedText;
				});
				return { default: name, named };
			}
		})();

		const is =
			specifier === 'beyond_context' ? 'internal.import' : !node.importClause?.isTypeOnly ? 'import' : 'type';

		push(dependencies, specifier, { is, properties });
		return;
	}

	// Keep looking for dependencies
	ts.forEachChild(node, node => analyze(node, dependencies));
};

module.exports = analyze;
