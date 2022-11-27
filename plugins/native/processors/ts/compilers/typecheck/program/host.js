const ts = require('typescript');
const {join, sep} = require('path');
const ModuleContainer = require('./module-container');
const SpecifierParser = require('beyond/utils/specifier-parser');

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

        return files.has(file) ? done(files.get(file).hash) : done(0);
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
     * @param parent string The file that imports the modules
     * @return {string[]}
     */
    host.resolveModuleNames = function (modules, parent) {
        const push = (resolved) => {
            output.push(resolved ? {resolvedFileName: resolved} : void 0);
        }

        const resolveRelativeSpecifier = module => {
            void module;
            push();
        }

        const resolveNonRelativeSpecifier = module => {
            const specifier = new SpecifierParser(module);
            const container = new ModuleContainer(compiler, parent);
            const path = join(process.cwd(), '.beyond/types', container.pkg.vname, `${specifier.subpath}.d.ts`);
            push(path);
        }

        /**
         * Iterate to resolve the modules
         */
        const output = [];
        modules.forEach(module => module.startsWith('.') ?
            resolveRelativeSpecifier(module) : resolveNonRelativeSpecifier(module));
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
