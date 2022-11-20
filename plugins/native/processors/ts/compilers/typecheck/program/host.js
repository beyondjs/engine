const ts = require('typescript');
const {sep} = require('path');

exports.createHost = compiler => {
    'use strict';

    const {previous} = compiler;
    const {tsconfig, files} = compiler.processor.sources;

    const emitted = new Map();
    const cachedSources = previous ? previous.cachedSources : new Map();

    const host = ts.createIncrementalCompilerHost(tsconfig.content, ts.sys);
    const {getSourceFile, readFile, fileExists} = host;

    host.fileExists = function (file) {
        return fileExists(file);
    }

    host.getSourceFile = function (file, languageVersion) {
        const done = (hash) => {
            hash = hash ? hash : 0;
            if (cachedSources.has(file) && cachedSources.get(file).hash === hash) {
                return cachedSources.get(file).source;
            }

            const source = getSourceFile(file, languageVersion);
            cachedSources.set(file, {source, hash});
            return source;
        }

        if (files.has(file)) return done(files.get(file).hash);
    }

    /**
     * Return the content of the file being required
     * @param file {string} The absolute path to the file
     * @return {*}
     */
    host.readFile = file => {
        if (file.endsWith('tsconfig.tsbuildinfo')) return previous?.tsBuildInfo;

        if (files.has(file)) return files.get(file).content;

        return readFile(file);
    }

    /**
     * Module resolution
     * @param modules string[] The modules being required
     * @param parent string The file that imports the module
     * @return {string[]}
     */
    host.resolveModuleNames = function (modules, parent) {
        console.log('resolveModuleNames', modules, parent);
        const output = [];

        const push = (module, resolved) => {
            !module.startsWith('.') && cachedSources.set(module, resolved);
            output.push(resolved ? {resolvedFileName: resolved} : undefined);
        }

        /**
         * Iterate to resolve the modules
         */
        modules.forEach(module => {
            // Check if module was already resolved
            if (cachedSources.has(module)) return push(module, cachedSources.get(module));

            // The beyond context
            if (module === 'beyond_context') return push(module, `${module}.ts`);

            // Check if it is a bundle of a BeyondJS local module
            if (declarations.has(module)) {
                const declaration = declarations.get(module);

                // Check if it is a dependency to a bundle of a local BeyondJS module
                const {kind} = declaration.dependency;
                if (['bundle', 'transversal'].includes(kind)) return push(module, `${module}.d.ts`);
            }

            const resolved = (() => {
                // Let typescript solve the dependency
                const {resolvedModule} = ts.resolveModuleName(module, parent, options.value, host);
                return resolvedModule?.resolvedFileName;
            })();

            return push(module, resolved);
        });
        return output;
    }

    host.getCurrentDirectory = function () {
        return compiler.processor.path;
    }

    host.writeFile = function (file, content) {
        file = sep === '/' ? file : file.replace(/\//g, sep);
        emitted.set(file, content);
    }

    return {host, emitted, cachedSources};
}
