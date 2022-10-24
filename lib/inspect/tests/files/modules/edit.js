(async () => {

    try {

        const {Project, Module} = require('../imports');

        const wd = require('path').join(process.cwd(), 'app');
        const project = new Project(wd);
        await project.load();
        /**
         * Parameters required to create a Module
         * @type {{route: string, name: string, processors: *[], title: string, bundle: string}}
         */
        const name = `module-to-edit`;
        const module = new Module(project.modulesPath, name);
        await module.load();

        // module.bundles.add("page");
        const response = await module.save({
            start: {processors: ["ts"]},
            page: {processors: ["ts"]},
            ts: {processors: ["ts"]},
            platforms: ["ios", "android"]
        });
        console.log("ready", response, project.modulesPath);

    }
    catch (e) {
        console.error(e);
    }

})();
