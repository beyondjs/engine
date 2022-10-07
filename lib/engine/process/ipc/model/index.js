module.exports = new class {
    #core;
    get core() {
        return this.#core;
    }

    #http;
    get http() {
        return this.#http;
    }

    #Application;
    get Application() {
        return this.#Application;
    }

    #ApplicationLibrary;
    get ApplicationLibrary() {
        return this.#ApplicationLibrary;
    }

    #ApplicationModule;
    get ApplicationModule() {
        return this.#ApplicationModule;
    }

    #ApplicationStatic;
    get ApplicationStatic() {
        return this.#ApplicationStatic;
    }

    #Distribution;
    get Distribution() {
        return this.#Distribution;
    }

    #Packager;
    get Packager() {
        return this.#Packager;
    }

    #ProcessorCompiler;
    get ProcessorCompiler() {
        return this.#ProcessorCompiler;
    }

    #Library;
    get Library() {
        return this.#Library;
    }

    #LibraryStatic;
    get LibraryStatic() {
        return this.#LibraryStatic;
    }

    #Module;
    get Module() {
        return this.#Module;
    }

    #Bundle;
    get Bundle() {
        return this.#Bundle;
    }

    #Processor;
    get Processor() {
        return this.#Processor;
    }

    #Source;
    get Source() {
        return this.#Source;
    }

    #Overwrite;
    get Overwrite() {
        return this.#Overwrite;
    }

    #Dependency;
    get Dependency() {
        return this.#Dependency;
    }

    #Compiler;
    get Compiler() {
        return this.#Compiler;
    }

    #External;
    get External() {
        return this.#External;
    }

    #TemplateOverwrite;
    get TemplateOverwrite() {
        return this.#TemplateOverwrite;
    }

    #Template;
    get Template() {
        return this.#Template;
    }

    #Collection;
    get Collection() {
        return this.#Collection;
    }

    #initialised = false;

    initialise(core, http) {
        this.#core = core;
        this.#http = http;

        if (this.#initialised) throw new Error('Model already initialised');
        this.#initialised = true;

        this.#Application = require('./application')(this);
        this.#ApplicationLibrary = require('./application/library')(this);
        this.#ApplicationModule = require('./application/module')(this);
        this.#ApplicationStatic = require('./application/static')(this);

        this.#Packager = require('./packager')(this);
        this.#Distribution = require('./distribution')(this);
        this.#ProcessorCompiler = require('./processor-compiler')(this);

        this.#Library = require('./library')(this);
        this.#LibraryStatic = require('./library/static')(this);

        this.#Module = require('./module')(this);
        this.#Bundle = require('./bundle')(this);
        this.#Processor = require('./processor')(this);

        this.#Source = require('./source/source')(this);
        this.#Compiler = require('./source/compiler')(this);
        this.#Overwrite = require('./source/overwrite')(this);
        this.#Dependency = require('./source/dependency')(this);

        this.#External = require('./external')(this);

        this.#Template = require('./template')(this);
        this.#TemplateOverwrite = require('./overwrite')(this);

        this.#Collection = require('./collection');
    }

    webDistribution(platform = 'web') {
        return {key: 'dashboard', platform: platform, ts: {compiler: 'tsc'}};
    }

    #projects = new Map();
    #bundleDistributions = new Map();

    async projectDistributions(projectId) {
        let project;
        if (this.#projects.has(projectId)) project = this.#projects.get(projectId);
        else {
            project = new this.#Application(`application//${projectId}`);
            await project.ready;
            if (!!project.error) return [];
            await project.deployment.ready;
            await project.deployment.distributions.ready;
            this.#projects.set(projectId, project);
        }

        const {distributions} = project.deployment;
        if (!distributions) return [];

        const entries = new Set();
        distributions.forEach(dist => entries.add(dist.platform));

        return entries;
    }

    /**
     *
     * The bundles are requested according to the type of project
     *
     * If the project is of the web-backend type, all the bundles with the web platform are requested,
     * except the bridges that are requested with the backend platform
     * If a bundle does not have a defined web platform, it is requested with which it is configured.
     *
     * @param bundle
     * @param platforms
     * @param distributions
     * @returns {string|unknown}
     */
    bundlePlatform(bundle, platforms, distributions) {
        let type = Array.from(distributions)[0];
        if (distributions.size > 1) {
            distributions.has('web') && distributions.has('backend') && (type = 'web-backend');
        }

        if (type !== 'web-backend') return type;

        if (bundle.type === 'bridge') return 'backend';
        if (!platforms.has('web')) return Array.from(platforms)[0];
        return 'web';
    }

    async distribution(projectId, bundle, platforms) {
        if (this.#bundleDistributions.has(bundle.id)) {
            return this.#bundleDistributions.get(bundle.id);
        }

        const distributions = await this.projectDistributions(projectId);
        if (!distributions.size) return;

        const platform = this.bundlePlatform(bundle, platforms, distributions);
        const distribution = {key: 'dashboard', platform: platform, ts: {compiler: 'tsc'}};
        this.#bundleDistributions.set(bundle.id, distribution);

        return distribution;
    }
};