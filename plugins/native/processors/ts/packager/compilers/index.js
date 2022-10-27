module.exports = new class {
    get(packager) {
        const {cspecs} = packager.processor.specs;
        return cspecs.tsc === 'compiler' ? require('./tsc') : require(`./transpiler`);
    }
}
