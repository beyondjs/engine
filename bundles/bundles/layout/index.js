module.exports = {
    name: 'layout',
    extname: ['.js', '.css'],
    bundle: {
        Bundle: require('./bundle'),
        processors: ['less', 'scss', 'ts', 'jsx', 'js']
    },
    start: {
        Start: require('./start')
    },
    template: true
};
