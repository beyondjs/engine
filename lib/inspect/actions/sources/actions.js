module.exports = function () {
    return {
        processor: {
            monitor: 'main-client', action: 'applications/modules/processors/get'
        },
        backend: {
            monitor: 'main-client', action: 'modules/get'
        },
        'template-application': {
            monitor: 'main-client', action: 'templates/applications/get'
        },
        'template-processors': {
            monitor: 'main-client', action: 'templates/processors/get'
        },
        bee: {
            monitor: 'main', action: 'bee/data'
        },
        overwrite: {
            monitor: 'main-client', action: 'templates/overwrites/get'
        }
    }
};