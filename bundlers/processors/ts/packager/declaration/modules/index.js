const ts = require('typescript');

module.exports = function (compiler) {
    // Create typescript sources from the compiler declaration files
    const tsSources = new Map();
    compiler.files.forEach(compiled => {
        const module = compiled.relative.file.replace('.ts', '.d.ts');
        if (!compiled.declaration) return;

        const source = ts.createSourceFile(module, compiled.declaration);
        tsSources.set(module, source);
    });

    // Transform the imports
    const imports = new (require('./transform'))(compiler, tsSources, compiler.files);

    // Transform the declarations code of each module into their corresponding namespaces
    require('./namespaces')(compiler, tsSources);

    let output = '';

    imports.dependencies.forEach((name, module) => {
        output += `import * as ${name} from '${module}';\n`;
    });
    imports.dependencies.size ? (output += '\n') : null;

    const printer = ts.createPrinter();
    tsSources.forEach((source, file) => {
        const code = printer.printFile(source);
        if (!code) return;

        output += `// FILE: ${file}\n`;
        output += code;
        output += '\n';
    });

    return output;
}
