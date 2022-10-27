module.exports = {
    name: 'ts',
    Hashes: require('./processor/hashes'),
    options: {
        Options: require('./processor/options'),
        file: 'tsconfig.json'
    },
    sources: {
        extname: ['.ts', '.tsx']
    },
    Analyzer: require('./processor/analyzer'),
    Dependencies: require('./processor/dependencies'),
    packager: {
        compiler: packager => require('./packager/compilers').get(packager),
        declaration: packager => packager.compiler.is === 'tsc' && require('./packager/declaration'),
        Js: require('./packager/code')
    }
}
