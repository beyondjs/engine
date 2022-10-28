const {Plugin} = require('beyond/plugins/helpers');
const Conditional = require('./conditional');

module.exports = class extends Plugin {
    static get name() {
        return 'code';
    }

    conditional(pexport, platform) {
        return new Conditional(pexport, platform);
    }
}
