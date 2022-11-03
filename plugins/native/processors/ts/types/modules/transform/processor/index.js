const ts = require('typescript');

/**
 * Collection of imports of the declaration files of a ts processor
 */
module.exports = class {
    #compiler;

    #dependencies = new Map();
    get dependencies() {
        return this.#dependencies;
    }

    #counter = 0;

    constructor(compiler) {
        this.#compiler = compiler;
    }

    /**
     * Add an import of a module, to the collection of imports of the ts processor
     *
     * @param module {string} The internal module being processed
     * @param node {object} The import node of the AST
     * @param factory {object} The factory of the transform function
     * @returns {object} Returns the translated node
     */
    add(module, node, factory) {
        if (node.kind !== ts.SyntaxKind.ImportDeclaration) {
            throw new Error('Node type should be an ImportDeclaration');
        }

        // The module being imported
        let imported = node.moduleSpecifier.text;

        let importName; // The name of the variable to which the import is assigned
        if (imported.startsWith('.')) {
            importName = require('../../namespaces/name')(this.#compiler, imported, module);
        }
        else if (this.#dependencies.has(imported)) {
            importName = this.#dependencies.get(imported);
        }
        else {
            importName = `dependency_${this.#counter}`;
            this.#dependencies.set(imported, importName);
            this.#counter++;
        }

        // One import expression could be translated in one or many alias imports
        // Example:
        // import defaultExport, { export1 , export2 as alias2 } from "module-name";
        // Into:
        // import defaultExport = dependency_x.default;
        // import export1 = dependency_x.export1;
        // import alias2 = dependency_x.export2;
        let translated = [];

        let translatedNode;

        // Translate a defaultImport if exists
        translatedNode = require('./default')(importName, node, factory);
        translatedNode && translated.push(translatedNode);

        // Translate namespace import
        translatedNode = require('./namespace')(importName, node, factory);
        translatedNode && translated.push(translatedNode);

        // Translate named imports if exists (import {export1, export2})
        const translatedNodes = require('./named')(importName, node, factory);
        translated = translatedNodes ? translated.concat(translatedNodes) : translated;

        return translated;
    }
}
