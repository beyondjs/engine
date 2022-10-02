const {utils: {fs}, platforms: {webAndMobile}} = global;

module.exports = async function (distribution, path) {
    if (distribution.npm || !webAndMobile.includes(distribution.platform)) {
        return;
    }

    const code = `/* /index.html 200`;
    const target = require('path').join(path, '_redirects');
    await fs.save(target, code, 'utf8');
}