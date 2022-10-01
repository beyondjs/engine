/**
 * Native BeyondJS processors
 */

const processors = [];

try {
    processors.push(require('./ts'));
    processors.push(require('./sass'));
    processors.push(require('./txt'));
    processors.push(require('./svelte'));
    processors.push(require('./vue'));

    // Just for legacy support
    processors.push(require('./js'));
    processors.push(require('./jsx'));
    processors.push(require('./css').scss);
    processors.push(require('./css').less);
}
catch (exc) {
    console.error(exc.stack);
    processors.length = 0;
}

module.exports = processors;
