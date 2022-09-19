const specs = {
    name: 'scss',
    config: require('./config'),
    Hashes: require('./processor/hashes'),
    sources: {
        overwrites: true,
        Sources: require('./processor/sources'),
        extname: '.scss'
    },
    packager: {
        compiler: () => require('./packager/compiler'),
        Js: require('./packager/js'),
        Css: require('./packager/css')
    }
};

module.exports = {
    scss: Object.assign({name: 'scss'}, specs),
    less: Object.assign({name: 'less'}, specs)
}
