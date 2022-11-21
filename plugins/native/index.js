module.exports = {
    plugins: [
        require('./module/test'),
        require('./module/code'),
        require('./module/ts'),
        require('./module/sass')
    ],
    processors: [
        require('./processors/test'),
        require('./processors/ts'),
        require('./processors/sass')
    ]
}
