const {Plugin} = require('beyond/plugins/helpers');
const Bundle = require('./bundle');

module.exports = class extends Plugin {
    conditional(pexport, platform) {
        return new Bundle(pexport, platform);
    }
}
