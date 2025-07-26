const processSourceMap = require("../process-sourcemap");
module.exports = function (bundle, is, code, map, extname, mode, platform) {
    if (!code) return '';
    if (mode === 'none') return code;
    if (!map || (!map.sources.length && !map.names.length)) return code;

    if (mode === 'inline') {
        const convert = require('convert-source-map');
        const options = extname === '.css' ? {multiline: true} : void 0;

        map = processSourceMap(bundle, map, platform);
        const inline = convert.fromObject(map).toComment(options);
        return code + '\n' + inline;
    }
    else if (mode === 'external') {
        const name = is === 'transversal' ? bundle.type : bundle.subpath.split('/').pop();
        const comment = extname === '.css' ?
                        `/*# sourceMappingURL=./${name}${extname}.map*/` :
                        `//# sourceMappingURL=./${name}${extname}.map`;
        return code + '\n' + comment;
    }

    throw new Error('Parameter mode is invalid');
}
