const {TxtBundle} = require('beyond/bundler-helpers');

module.exports = {
    name: 'txt',
    extname: ['.js'],
    multilanguage: true,
    bundle: {
        Bundle: TxtBundle,
        processors: ['txt'],
        template: true
    }
};
