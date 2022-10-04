const ts = require('typescript');
const sep = require('path').sep;

exports.create = (path, files, dependencies, options, tsBuildInfo) => {
    const cached = new Map(); // The non relative already resolved modules
    const externals = new Set();
    const emitted = new Map();

    const host = ts.createIncrementalCompilerHost(options, ts.sys);
    const {fileExists, readFile} = host;

    const cache = new Map();
    host.getSourceFile = function (file, languageVersion) {
        const done = (file, content, hash) => {
            hash = hash ? hash : 0;
            if (cache.has(file) && cache.get(file).hash === hash) return cache.get(file).source;

            const source = ts.createSourceFile(file, content, languageVersion);
            source.version = hash;
            cache.set(file, {source, hash});

            return source;
        }

        // The beyond context that returns the bundle, module or library objects
        if (file === `beyond_context.ts`) return done(file, require('../context'));

        // Check if it is an internal module of the bundle being compiled
        if (files.has(file)) {
            const {content, hash} = files.get(file);
            return done(file, content, hash);
        }

        const module = file.substr(0, file.length - 5); // Remove the .dts extension
        if (dependencies.has(module)) {
            const {kind, dts, hash} = dependencies.get(module);
            if (['bundle', 'transversal'].includes(kind)) return done(file, dts, hash);
        }

        // Let typescript to look for the file
        if (fileExists(file)) return done(file, readFile(file));
    }

    host.resolveModuleNames = function (modules, container) {
        const output = [];

        const push = (module, resolved) => {
            !module.startsWith('.') && cached.set(module, resolved);
            output.push(resolved ? {resolvedFileName: resolved} : undefined);
        }

        modules.forEach(module => {
            // Check if module was already resolved
            if (cached.has(module)) return push(module, cached.get(module));

            // The beyond context
            if (module === 'beyond_context') return push(module, `${module}.ts`);

            // Check if it is a bundle of a BeyondJS local module
            if (dependencies.has(module)) {
                const dependency = dependencies.get(module);

                // Check if it is a dependency to a bundle of a local BeyondJS module
                if (['bundle', 'transversal'].includes(dependency.kind)) {
                    return push(module, `${module}.d.ts`);
                }
            }

            // Check if module is an external dependency
            (() => {
                if (module.startsWith('.')) return;
                if (container.includes(`${sep}node_modules${sep}@types${sep}`)) return;
                externals.add(module);
            })(module);

            // Let typescript solve the dependency
            const {resolvedModule} = ts.resolveModuleName(module, container, options, host);
            const resolved = resolvedModule?.resolvedFileName;

            // Check if it is a bundle internal module, but the file is excluded or not reached
            // by the configuration of the processor
            if (resolved?.startsWith(`${path}${sep}`) && !files.has(resolved)) return done(module);

            return push(module, resolved);
        });

        return output;
    }

    host.getCurrentDirectory = () => path;

    host.readFile = (file) => {
        return file === 'tsconfig.tsbuildinfo' ? tsBuildInfo : readFile(file);
    }

    host.writeFile = function (file, content) {
        file = sep === '/' ? file : file.replace(/\//g, sep);
        emitted.set(file, content);
    }

    return {host, externals, emitted};
}
