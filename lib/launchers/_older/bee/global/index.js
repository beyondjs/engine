const lib = require('path').join(__dirname, '../../../..');
Object.defineProperty(global, 'lib', {get: () => lib});

const errors = new (require(`./errors`))();
Object.defineProperty(global, 'errors', {get: () => errors});

const utils = require(`${lib}/utils`);
Object.defineProperty(global, 'utils', {get: () => utils});
