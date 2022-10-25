const {join} = require('path');
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
        const module = new Module(join(project.modulesPath, name));
        await module.load();
        // module.bundles.add("page");
        const response = await module.save({
            title: "test 1",
            start: {processors: ["ts"]},
            ts: {processors: ["ts"]},
            page: {element: {name: 'app-page'}, processors:["ts"]},
            platforms: ["android"]
        });
        console.log("ready", response, project.modulesPath);
        setTimeout(() => console.log("END============="), 10000000)
    }
    catch (e) {
        console.error(e);
    }

})();
