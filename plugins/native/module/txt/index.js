const {TxtBundle} = require('beyond/plugins/helpers');

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
