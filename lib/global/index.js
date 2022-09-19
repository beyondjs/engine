const lib = require('path').join(__dirname, '..');
Object.defineProperty(global, 'lib', {get: () => lib});

const utils = (require('../utils'));
Object.defineProperty(global, 'utils', {get: () => utils});

const environments = ['development', 'testing', 'production', 'quality', 'integration'];
Object.defineProperty(global, 'environments', {get: () => environments});

const errors = new (require(`./errors`));
Object.defineProperty(global, 'errors', {get: () => errors});

const templatesPath = require('path').join(__dirname, '../templates');
Object.defineProperty(global, 'templates', {get: () => templatesPath});
