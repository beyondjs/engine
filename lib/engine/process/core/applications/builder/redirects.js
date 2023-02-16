const {utils: {fs}} = global;

module.exports = async function (distribution, path) {
    if (distribution.npm || distribution.platform !== 'web') {
        return;
    }

    const code = `/* /index.html 200`;
    const target = require('path').join(path, '_redirects');
    await fs.save(target, code, 'utf8');
}