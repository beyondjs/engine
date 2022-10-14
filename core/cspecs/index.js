const platforms = ['browser', 'node', 'deno'];
const cspecs = require('./cspecs')(platforms);

module.exports = {platforms, cspecs};
