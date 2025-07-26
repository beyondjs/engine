module.exports = function (is, code, map, mode) {
    if (!code) return '';
    if (mode === 'none' || !map) return code;
    if (!map.sources.length && !map.names.length) return code;

    if (mode === 'inline') {
        const convert = require('convert-source-map');
        const options = {multiline: true};
        const inline = convert.fromObject(map).toComment(options);
        return code + '\n' + inline;
    }
    else if (mode === 'external') {
        const source = is === 'application' ? 'styles.css.map' : 'global.css.map';
        const comment = `/*# sourceMappingURL=${source}*/`;
        return code + '\n' + comment;
    }

    throw new Error('Parameter mode is invalid');
}
