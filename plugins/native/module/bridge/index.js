const {Plugin} = require('beyond/plugins/helpers');

module.exports = class extends Plugin {
    subpaths(subpaths) {
        const {subpath} = this;
        subpaths.set(subpath);
        subpaths.set(`${subpath}/client`, {layer: 'client'});
    }
}
