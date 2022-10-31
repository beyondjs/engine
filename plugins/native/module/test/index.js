const {Plugin} = require('beyond/plugins/sdk');
const Conditional = require('./conditional');

module.exports = class extends Plugin {
    static get name() {
        return 'test';
    }

    _conditional(pexport, platform) {
        return new Conditional(pexport, platform);
    }
}
