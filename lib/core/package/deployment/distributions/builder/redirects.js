const fs = require('beyond/utils/fs');
const {platforms} = require('beyond/cspecs');

module.exports = async function (distribution, path) {
    if (distribution.npm || !platforms.webAndMobile.includes(distribution.platform)) {
        return;
    }

    const code = `/* /index.html 200`;
    const target = require('path').join(path, '_redirects');
    await fs.save(target, code, 'utf8');
}
