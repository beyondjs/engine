module.exports = function (bundle, code, map, extname, mode, type) {
    if (!code) return '';
    if (mode === 'none') return code;
    if (!map || (!map.sources.length && !map.names.length)) return code;

    if (mode === 'inline') {
        const convert = require('convert-source-map');
        const options = extname === '.css' ? {multiline: true} : void 0;
        const inline = convert.fromObject(map).toComment(options);
        return code + '\n' + inline;
    }
    else if (mode === 'external') {
        const content = `sourceMappingURL=${bundle.subpath}.${type ? type : extname}.map`;
        const comment = extname === '.css' ? `/*# ${content}*/` : `//# ${content}`;
        return code + '\n' + comment;
    }

    throw new Error('Parameter mode is invalid');
}
