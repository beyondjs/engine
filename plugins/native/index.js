module.exports = {
    plugins: [
        require('./module/test'),
        require('./module/code')
    ],
    processors: [
        require('./processors/test'),
        require('./processors/ts')
    ]
}
