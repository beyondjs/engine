const path = '../../../../lib/dashboard/libraries/dashboard/service/builder/models';
(async () => {
    require('../../../../lib/global');
    /**
     * Instance the template objects with a path
     */
    require(`${path}/templates`).get('../../../../lib/templates');
    const {Project, Module} = require(`${path}`);
    const apps = {
        app_1: 'app',
        app_2: 'app_no_modules_in_json'
    }
    const wd = require('path').join(process.cwd(), apps.app_1);

    const project = new Project(wd);
    /**
     * Parameters required to create a Module
     * @type {{route: string, name: string, processors: *[], title: string, bundle: string}}
     */
    const specs = {
        route: '/test',
        title: 'Test',
        bundle: 'page',
        processors: [],
        name: 'module-to-read'
    };
    const module = new Module(project.modulesPath, specs.name);
    await module.load();

    global.module = module;
})();
