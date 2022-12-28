const path = require('path');
const {sep} = path;

module.exports = function (compiler, module, from) {
    // Remove the extension of the file
    const extensions = ['.d.ts', '.d.tsx', '.ts', '.tsx'];
    for (const ext of extensions) {
        if (module.endsWith(ext)) {
            module = module.substr(0, module.length - ext.length);
            break;
        }
    }

    if (from && module.startsWith('.')) {
        from = path.resolve(from, '..'); // Remove the filename

        // The resolve function resolves adding the path of the process.cwd, so remove it
        module = path.resolve(from, module);

        module = module.substring(process.cwd().length);
        module = `.${module}`;
    }

    module = sep === '/' ? module : module.replace(/\\/g, '/');

    let name = (() => {
        const name = module.startsWith(`./`) ? module.substr(2) : module;

        const check = name => ['.ts', '.tsx'].find(ext => {
            let im = `${name}${ext}`;
            im = sep === '/' ? im : im.replace(/\//g, '\\');
            return compiler.files.has(im) || compiler.extensions.has(im);
        });

        if (check(name)) return name;
        if (check(`${name}/index`)) return `${name}/index`;

        throw new Error(`Module "${module}" not found in compiler output`);
    })();

    name = name.replace(/\//gi, '_');
    name = name.replace(/[^\w\s]/gi, '');
    return `ns_${name}`;
}
