/**
 * Processor, Source and Bundle are objects that are exposed globally
 * in lib/client/process/core/global/index.js
 *
 * The registry is created in lib/client/process/core/index.js, and exposed globally
 * in lib/client/process/core/global/index.js
 */
module.exports = new class {
    #Dependency = (require('./dependencies/dependency'));
    get Dependency() {
        return this.#Dependency;
    }

    #DependenciesPropagator = (require('./dependencies/propagator'));
    get DependenciesPropagator() {
        return this.#DependenciesPropagator;
    }

    #Bundle = (require('./bundle'));
    get Bundle() {
        return this.#Bundle;
    }

    #BundlePackager = (require('./bundle/packager'));
    get BundlePackager() {
        return this.#BundlePackager;
    }

    #BundleCodeBase = (require('./bundle/packager/code/base'));
    get BundleCodeBase() {
        return this.#BundleCodeBase;
    }

    #BundleJsCode = (require('./bundle/packager/code/js'));
    get BundleJsCode() {
        return this.#BundleJsCode;
    }

    #BundleCssCode = (require('./bundle/packager/code/css'));
    get BundleCssCode() {
        return this.#BundleCssCode;
    }

    #BundleDependencies = (require('./bundle/packager/dependencies'));
    get BundleDependencies() {
        return this.#BundleDependencies;
    }

    #Bundles = (require('./bundles'));
    get Bundles() {
        return this.#Bundles;
    }

    #BundlesConfig = (require('./bundles/config'));
    get BundlesConfig() {
        return this.#BundlesConfig;
    }

    #TxtBundle = (require('./txt/bundle'));
    get TxtBundle() {
        return this.#TxtBundle;
    }

    #TxtTransversal = (require('./txt/transversal'));
    get TxtTransversal() {
        return this.#TxtTransversal;
    }

    #Transversal = (require('./transversal'));
    get Transversal() {
        return this.#Transversal;
    }

    #TransversalDependencies = (require('./transversal/packager/dependencies'));
    get TransversalDependencies() {
        return this.#TransversalDependencies;
    }

    #TransversalPackager = (require('./transversal/packager'));
    get TransversalPackager() {
        return this.#TransversalPackager;
    }

    #TransversalCodePackager = (require('./transversal/packager/code'));
    get TransversalCodePackager() {
        return this.#TransversalCodePackager;
    }

    #ProcessorBase = (require('./processor/base'));
    get ProcessorBase() {
        return this.#ProcessorBase;
    }

    #ProcessorSourcesDependencies = (require('./processor/base/dependencies/sources'));
    get ProcessorSourcesDependencies() {
        return this.#ProcessorSourcesDependencies;
    }

    #ProcessorHashes = (require('./processor/base/hashes'));
    get ProcessorHashes() {
        return this.#ProcessorHashes;
    }

    #ProcessorSources = (require('./processor/base/sources'));
    get ProcessorSources() {
        return this.#ProcessorSources;
    }

    #ProcessorSourcesHashes = (require('./processor/base/sources/hashes'));
    get ProcessorSourcesHashes() {
        return this.#ProcessorSourcesHashes;
    }

    #ProcessorSource = (require('./processor/source'));
    get ProcessorSource() {
        return this.#ProcessorSource;
    }

    #ProcessorCompiledSource = (require('./processor/source/compiled'));
    get ProcessorCompiledSource() {
        return this.#ProcessorCompiledSource;
    }

    #ProcessorOptions = (require('./processor/base/sources/options'));
    get ProcessorOptions() {
        return this.#ProcessorOptions;
    }

    #ProcessorAnalyzer = (require('./processor/base/analyzer'));
    get ProcessorAnalyzer() {
        return this.#ProcessorAnalyzer;
    }

    #ProcessorSinglyAnalyzer = (require('./processor/base/analyzer/singly'));
    get ProcessorSinglyAnalyzer() {
        return this.#ProcessorSinglyAnalyzer;
    }

    #ProcessorAnalyzerSource = (require('./processor/base/analyzer/source'));
    get ProcessorAnalyzerSource() {
        return this.#ProcessorAnalyzerSource;
    }

    #ProcessorAnalyzerDependencies = (require('./processor/base/dependencies/analyzer'));
    get ProcessorAnalyzerDependencies() {
        return this.#ProcessorAnalyzerDependencies;
    }

    #ProcessorPackager = (require('./processor/packager'));
    get ProcessorPackager() {
        return this.#ProcessorPackager;
    }

    #ProcessorCompiler = (require('./processor/packager/compiler'));
    get ProcessorCompiler() {
        return this.#ProcessorCompiler;
    }

    #ProcessorSinglyCompiler = (require('./processor/packager/compiler/singly'));
    get ProcessorSinglyCompiler() {
        return this.#ProcessorSinglyCompiler;
    }

    #ProcessorCompilerChildren = (require('./processor/packager/compiler/children'));
    get ProcessorCompilerChildren() {
        return this.#ProcessorCompilerChildren;
    }

    #ProcessorCode = (require('./processor/packager/code'));
    get ProcessorCode() {
        return this.#ProcessorCode;
    }

    #ProcessorSinglyCode = (require('./processor/packager/code/singly'));
    get ProcessorSinglyCode() {
        return this.#ProcessorSinglyCode;
    }

    #ProcessorDeclaration = (require('./processor/packager/declaration'));
    get ProcessorDeclaration() {
        return this.#ProcessorDeclaration;
    }

    #ProcessorsExtender = (require('./processor/extender'));
    get ProcessorsExtender() {
        return this.#ProcessorsExtender;
    }

    #ProcessorsExtenderPreprocessor = (require('./processor/extender/preprocessor'));
    get ProcessorsExtenderPreprocessor() {
        return this.#ProcessorsExtenderPreprocessor;
    }

    #ProcessorsExtenderSinglyPreprocessor = (require('./processor/extender/preprocessor/singly'));
    get ProcessorsExtenderSinglyPreprocessor() {
        return this.#ProcessorsExtenderSinglyPreprocessor;
    }

    #SourceMap = (require('./sourcemap'));
    get SourceMap() {
        return this.#SourceMap;
    }

    #registries = require('./registries');

    createRegistries(config) {
        this.#registries.create(config);
    }

    get bundles() {
        return this.#registries.bundles;
    }

    get processors() {
        return this.#registries.processors;
    }
};
