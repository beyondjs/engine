exports.DependenciesTreeCache = require('./cache/dependencies-tree');
exports.ConditionalCodeCache = require('./cache/conditional-code');
exports.ProcessorCompilerCache = require('./cache/processor-compiler');
exports.ProcessorCodeCache = require('./cache/processor-code');
exports.ExternalsRegistryCache = require('./cache/externals-registry');

// exports.ProcessorAnalyzerCache = require('./cache/processors-analyzers');
// exports.BundleTypesCache = require('./cache/bundle-types');
// exports.ExtenderPreprocessorCache = require('./cache/extenders-preprocessors');
// exports.TransversalsCodeCache = require('./cache/transversals-code');

exports.dependencies = new (require('./dependencies'))();
