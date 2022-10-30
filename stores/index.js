exports.DependenciesTreeCache = require('./cache/dependencies-tree');
exports.ExternalsRegistryCache = require('./cache/externals-registry');
exports.ProcessorAnalyzerCache = require('./cache/processors-analyzers');
exports.CodeCache = require('./cache/code');
exports.BundleTypesCache = require('./cache/bundle-types');
exports.ExtenderPreprocessorCache = require('./cache/extenders-preprocessors');
exports.PackagerCompilerCache = require('./cache/packagers-compilers');
exports.TransversalsCodeCache = require('./cache/transversals-code');

exports.dependencies = new (require('./dependencies'))();
