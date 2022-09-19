const ts = require('typescript');
const sep = require('path').sep;

const sourcesCached = new Map();

exports.create = (compiler) => {
    'use strict';

    const {declarations, options, specs} = compiler;
    const {path} = specs.bundle;

    // The key of the files must be the full path, not the relative
    const externals = new Set();
    const emitted = new Map();

    const resolvedModulesCached = new Map();

    const host = ts.createIncrementalCompilerHost(options.value, ts.sys);
    const {getSourceFile, readFile, fileExists} = host;

    host.fileExists = function (file) {
        const {is} = getBeyondSource(file);
        if (is) return true;

        return fileExists(file);
    }

    host.getSourceFile = function (file, languageVersion) {
        const cache = sourcesCached;

        const done = (hash) => {
            hash = hash ? hash : 0;
            if (cache.has(file) && cache.get(file).hash === hash) return cache.get(file).source;

            const source = getSourceFile(file, languageVersion);
            cache.set(file, {source, hash});
            return source;
        }

        const {is, source, declaration} = getBeyondSource(file);
        return done(is === 'bundle.declaration' ? declaration.hash : source?.hash);
    }

    const getBeyondSource = (resource) => {
        const file = sep === '/' ? resource : resource.replace(/\//g, sep);

        // Check if it is an internal module of the bundle being compiled
        const {files, extensions} = compiler.program.sources;
        if (files.has(file)) {
            const source = files.get(file);
            return {is: 'file', source};
        }

        // Check if it is a beyond bundle or transversal
        let module = resource.endsWith('.d.ts') && resource.substr(0, resource.length - 5); // Remove the .dts extension
        if (module && declarations.has(module)) {
            const declaration = declarations.get(module);
            const {kind} = declaration.dependency;

            if (['bundle', 'transversal'].includes(kind)) return {is: 'bundle.declaration', declaration};
        }

        // Remove the .ts extname to check if it is a file of a processor extension (ex: .svelte.ts => .svelte)
        module = !file.endsWith('.d.ts') && file.endsWith('.ts') && file.substr(0, file.length - 3);
        if (module && extensions.has(module)) {
            const source = extensions.get(module);
            return {is: 'extension', source};
        }

        return {};
    }

    host.readFile = file => {
        if (file.endsWith('tsconfig.tsbuildinfo')) return compiler.tsBuildInfo;

        // The beyond context that returns the bundle, module or library objects
        if (file.endsWith('beyond_context.ts')) return require('./context');

        const {is, source, declaration} = getBeyondSource(file);
        if (is) return is === 'bundle.declaration' ? declaration.value : source.content;

        // Let typescript to look for the file
        return readFile(file);
    }

    host.resolveModuleNames = function (modules, container) {
        const cache = resolvedModulesCached;
        const output = [];

        const push = (module, resolved) => {
            !module.startsWith('.') && cache.set(module, resolved);
            output.push(resolved ? {resolvedFileName: resolved} : undefined);
        }

        modules.forEach(module => {
            // Check if module was already resolved
            if (cache.has(module)) return push(module, cache.get(module));

            // The beyond context
            if (module === 'beyond_context') return push(module, `${module}.ts`);

            // Check if it is a bundle of a BeyondJS local module
            if (declarations.has(module)) {
                const declaration = declarations.get(module);

                // Check if it is a dependency to a bundle of a local BeyondJS module
                const {kind} = declaration.dependency;
                if (['bundle', 'transversal'].includes(kind)) return push(module, `${module}.d.ts`);
            }

            // Check if module is an external dependency
            (() => {
                if (module.startsWith('.')) return;
                if (container.includes(`${sep}node_modules${sep}@types${sep}`)) return;
                externals.add(module);
            })(module);

            const resolved = (() => {
                // Let typescript solve the dependency
                const {resolvedModule} = ts.resolveModuleName(module, container, options.value, host);
                return resolvedModule?.resolvedFileName;
            })();

            return push(module, resolved);
        });
        return output;
    }

    host.getCurrentDirectory = () => path;

    host.writeFile = function (file, content) {
        file = sep === '/' ? file : file.replace(/\//g, sep);
        emitted.set(file, content);
    }

    return {host, externals, emitted};
}
