module.exports = class {
    uglify(file, content) {
        let extname = require('path').extname(file).substr(1);
        extname = extname === '.htm' ? '.html' : extname;

        const supported = ['html', 'js', 'css'];
        if (!supported.includes(extname)) {
            throw new Error(`Resource with extension "${extname}" cannot be uglified`);
        }
        return require(`./${extname}.js`)(file, content);
    }
}