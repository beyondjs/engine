const {Config} = global.utils;

module.exports = class {
    constructor() {
        const config = new Config(process.cwd(), {
            '/bundles': 'object',
            '/processors': 'object',
            '/applications': 'array',
            '/applications/children/deployment': 'object',
            '/applications/children/modules': 'object',
            '/applications/children/modules/externals': 'object',
            '/applications/children/transversals': 'object',
            '/applications/children/static': 'object',
            '/applications/children/libraries': 'object',
            '/applications/children/excludes': 'object',
            '/applications/children/template': 'object',
            '/applications/children/template/application': 'object',
            '/applications/children/template/global': 'object',
            '/applications/children/template/processors': 'object',
            '/applications/children/template/overwrites': 'object'
        });

        config.data = 'beyond.json';
    }
}
