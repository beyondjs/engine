const platforms = ['browser', 'node', 'deno'];
const CSpecs = require('./cspecs')(platforms);

module.exports = {platforms, CSpecs};
