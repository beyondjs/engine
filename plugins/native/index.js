module.exports = {
    plugins: [
        require('./module/test'),
        require('./module/code'),
        require('./module/ts')
    ],
    processors: [
        require('./processors/test'),
        require('./processors/ts')
    ]
}
