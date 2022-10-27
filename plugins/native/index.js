module.exports = {
    plugins: new Map([
        ['code', require('./plugins/code')]
    ]),
    processors: new Map([
        ['ts', require('./processors/ts')]
    ])
}
