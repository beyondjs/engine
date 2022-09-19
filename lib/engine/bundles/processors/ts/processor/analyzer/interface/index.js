const ts = require('typescript');

/**
 * Extract the dependencies and exports of a typescript source code
 *
 * @param file {string} The relative path of the file
 * @param content {string} The content of the file
 * @return {{dependencies: Map, exports: Set}}
 */
module.exports = function (file, content) {
    const source = ts.createSourceFile(file, content);

    const output = {};
    output.dependencies = new Map();
    output.exports = new Set();

    // Find triple slash directives
    const re = /^\/\/\/\s*<reference\s*path\s*=\s*["'](.*)["'].*$/gm;
    let dependency;
    while ((dependency = re.exec(this.content))) {
        output.dependencies.set(dependency, new Set(['reference']));
    }

    // Traverse AST
    const visit = node => {
        if (node.kind === ts.SyntaxKind.SourceFile) return;

        require('./dependencies')(node, output.dependencies);
        require('./exports')(node, source, output.exports);
    }

    ts.forEachChild(source, visit);

    output.exports = [...output.exports].map(name => ({name, from: name}));

    return output;
};
