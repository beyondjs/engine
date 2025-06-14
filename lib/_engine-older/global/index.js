const lib = require('path').join(__dirname, '../../..');
Object.defineProperty(global, 'lib', { get: () => lib });

const platforms = require('./platforms');
Object.defineProperty(global, 'platforms', { get: () => platforms });

const Resource = require('./resource');
Object.defineProperty(global, 'Resource', { get: () => Resource });

// const PathnameParser = (require('./pathname-parser'));
// Object.defineProperty(global, 'PathnameParser', {get: () => PathnameParser});

const errors = new (require(`./errors`))();
Object.defineProperty(global, 'errors', { get: () => errors });
