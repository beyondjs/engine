module.exports = function () {
    return {
        processor: {
            monitor: 'engine', action: 'processors/get'
        },
        backend: {
            monitor: 'engine', action: 'modules/get'
        },
        'template-application': {
            monitor: 'engine', action: 'templates/applications/get'
        },
        'template-processors': {
            monitor: 'engine', action: 'templates/processors/get'
        },
        bee: {
            monitor: 'engine', action: 'bee/data'
        },
        overwrite: {
            monitor: 'engine', action: 'templates/overwrites/get'
        }
    }
}