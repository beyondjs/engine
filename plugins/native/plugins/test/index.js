const {Plugin} = require('beyond/plugins/sdk');
const Conditional = require('./conditional');

module.exports = class extends Plugin {
    conditional(pexport, platform) {
        return new Conditional(pexport, platform);
    }
}
