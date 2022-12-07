module.exports = {
    name: 'mdx',
    sources: {
        extname: '.mdx'
    },
    packager: {
        compiler: () => require('./compiler'),
        Js: require('./js')
    }
};
