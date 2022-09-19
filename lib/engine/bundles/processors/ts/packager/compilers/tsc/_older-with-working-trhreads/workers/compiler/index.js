const {parentPort} = require('worker_threads');
const ts = require('typescript');

function process(message) {
    const {path, sources, options, tsBuildInfo} = message;
    const files = new Map(sources.files);
    const dependencies = new Map(sources.dependencies);

    const {host, emitted, externals} = require('./host').create(path, files, dependencies, options, tsBuildInfo);
    const program = ts.createIncrementalProgram({rootNames: [...files.keys()], options, host});

    const result = program.emit();
    const {diagnostics} = result;

    const compilation = new (require('./compilation-data'))(files, {emitted, externals, diagnostics});

    // The host object extends a map that stores the emitted files
    parentPort.postMessage({
        type: 'processed',
        data: JSON.stringify(compilation)
    });
}

parentPort.on('message', process);
