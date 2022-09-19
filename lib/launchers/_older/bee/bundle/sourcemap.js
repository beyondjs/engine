module.exports = function (code, map) {
    if (!map || (!map.sources.length && !map.names.length)) return code;

    const convert = require('convert-source-map');
    const inline = convert.fromObject(map).toComment();
    return code + '\n' + inline;
}
