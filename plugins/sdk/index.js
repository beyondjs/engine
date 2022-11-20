exports.Dependency = require('./dependencies/dependency');

exports.Plugin = require('./plugin');

exports.TargetedExport = require('./targeted-export/targeted-export');
exports.TargetedExportResourceStandard = require('./targeted-export/targeted-export-resource/standard');
exports.TargetedExportResource = require('./targeted-export/targeted-export-resource/plugins');

exports.ProcessorsSet = require('./processors/set');
exports.Processor = require('./processors/processor');
exports.ProcessorCode = require('./processors/code');
exports.ProcessorScriptOutput = require('./processors/code-outputs/script');
exports.ProcessorStylesOutput = require('./processors/code-outputs/styles');
exports.NamespaceJS = require('./processors/code-outputs/ns-js');
exports.NamespaceTypes = require('./processors/code-outputs/ns-types');
exports.ProcessorCompiler = require('./processors/compiler');

exports.Sources = require('./processors/sources');
exports.SourcesFile = require('./processors/sources/file');
exports.SourcesHashes = require('./processors/sources/hashes');

exports.BundleJS = require('./bundle/js');
exports.BundleTypes = require('./bundle/types');
exports.SourceMap = (require('./sourcemap'));

exports.Diagnostics = require('./diagnostics/diagnostics');
exports.Diagnostic = require('./diagnostics/diagnostic');

// exports.BundleCodeBase = require('./bundle-code/base');
// exports.BundleJsCode = (require('./bundle-code/js'));
// exports.BundleCssCode = (require('./bundle-code/css'));
// exports.BundleDependencies = (require('./bundle/dependencies'));
// exports.TxtBundle = (require('./txt/bundle'));
// exports.TxtTransversal = (require('./txt/transversal'));
// exports.Transversal = (require('./transversal'));
// exports.TransversalDependencies = (require('./transversal/packager/dependencies'));
// exports.TransversalPackager = (require('./transversal/packager'));
// exports.TransversalCodePackager = (require('./transversal/packager/code'));
// exports.ProcessorBase = (require('./processor/base'));
// exports.ProcessorSourcesDependencies = (require('./processor/base/dependencies/sources'));
// exports.ProcessorHashes = (require('./processor/base/hashes'));
// exports.ProcessorSources = (require('./processor/base/sources'));
// exports.ProcessorSourcesHashes = (require('./processor/base/sources/hashes'));
// exports.ProcessorSource = (require('./processor/source'));
// exports.ProcessorCompiledSource = (require('./processor/source/compiled'));
// exports.ProcessorOptions = (require('./processor/base/sources/options'));
// exports.ProcessorAnalyzer = (require('./processor/base/analyzer'));
// exports.ProcessorSinglyAnalyzer = (require('./processor/base/analyzer/singly'));
// exports.ProcessorAnalyzerSource = (require('./processor/base/analyzer/source'));
// exports.ProcessorAnalyzerDependencies = (require('./processor/base/dependencies/analyzer'));
// exports.ProcessorPackager = (require('./processor/packager'));
// exports.ProcessorCompiler = (require('./processor/packager/compiler'));
// exports.ProcessorSinglyCompiler = (require('./processor/packager/compiler/singly'));
// exports.ProcessorCompilerChildren = (require('./processor/packager/compiler/children'));
// exports.ProcessorCode = (require('./processor/packager/code'));
// exports.ProcessorSinglyCode = (require('./processor/packager/code/singly'));
// exports.ProcessorDeclaration = (require('./processor/packager/declaration'));
// exports.ProcessorsExtender = (require('./processor/extender'));
// exports.ProcessorsExtenderPreprocessor = (require('./processor/extender/preprocessor'));
// exports.ProcessorsExtenderSinglyPreprocessor = (require('./processor/extender/preprocessor/singly'));
