module.exports = function (file, content) {
    let cleaned = new (require('clean-css'))().minify(content);
    if (cleaned.errors.length) return ({errors: cleaned.errors});

    const {warnings, styles: css} = cleaned;
    return {warnings, css};
}
