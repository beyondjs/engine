const {Plugin} = require('beyond/plugins/sdk');
const Bundle = require('./bundle');

module.exports = class extends Plugin {
    static get name() {
        return 'code';
    }

    _conditional(pexport, platform) {
        return new Bundle(pexport, platform);
    }
}
