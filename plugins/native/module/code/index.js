const {Plugin} = require('beyond/plugins/sdk');
const TargetedExport = require('./targeted-export');

module.exports = class extends Plugin {
    static get name() {
        return 'code';
    }

    _createTargetedExport(packageExport, platform) {
        return new TargetedExport(packageExport, platform);
    }
}
