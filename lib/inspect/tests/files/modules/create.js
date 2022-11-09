require('colors');
const {join} = require('path');
(async () => {
    const {Project, Module} = require('../imports');

    const wd = require('path').join(process.cwd(), 'app');
    const project = new Project(wd);
    /**
     * Parameters required to create a Module
     * @type {{route: string, name: string, processors: *[], title: string, bundle: string}}
     */
    const name = `test-${Math.floor(Math.random() * 100)}`;
    const specs = {
        name,
        title: 'Test',
        id: 'test-layout',
        bundles: ["ts"]
    };

    console.log(`creating`.blue, `${name}`.bgBlack, 'module'.blue);
    const module = new Module(join(project.modulesPath, specs.name));

    try {
        /**
         * Es necesario cargar el módulo aunque no exista.
         */
        await module.load();
        if (module.exists) {
            return console.log('the module already exists'.red);
        }

        await module.create(specs);
        console.log(`module ${name}`.green, 'created!'.green);
    }
    catch (e) {
        console.error(e);
    }
})();
