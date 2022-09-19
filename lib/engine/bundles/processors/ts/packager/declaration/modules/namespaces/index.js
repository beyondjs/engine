const ts = require('typescript');

/**
 * Transform the declarations code of each module into their corresponding namespaces
 *
 * @param compiler {object}
 * @param tsSources {Map<string, object>} The typescript sources
 */
module.exports = function (compiler, tsSources) {
    return tsSources.forEach((tsSource, module) => {
        const transform = require('./transform')(compiler, module);
        const transformed = ts.transform(tsSource, [transform]);
        tsSource.statements = [transformed.transformed[0]];
    });
}
