module.exports = function (config, meta) {
    let warnings = [];

    config = meta.config ? meta.config(config) : {sources: config};
    warnings = config.warnings ? warnings.concat(config.warnings) : warnings;
    if (config.errors) return {errors: config.errors, warnings};

    const sources = require('./sources')(config.sources);
    if (sources.errors) return {errors: sources.errors, warnings};

    warnings = sources.warnings ? warnings.concat(sources.warnings) : warnings;

    return {path: sources.path, errors: [], warnings, sources: sources.value, code: config.code};
}
