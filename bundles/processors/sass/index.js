module.exports = {
    name: 'sass',
    Hashes: require('./processor/hashes'),
    sources: {
        overwrites: true,
        Sources: require('./processor/sources'),
        Hashes: require('./processor/sources/hashes'),
        extname: '.scss'
    },
    Analyzer: require('./processor/analyzer'),
    Dependencies: require('./processor/dependencies'),
    packager: {
        compiler: () => require('./packager/compiler'),
        Css: require('./packager/code/css'),
        Js: require('./packager/code/js')
    }
};
