const path = '../../../../lib/dashboard/libraries/dashboard/service/builder/models';
(async () => {
    require('../../../../lib/global');
    const {fs} = global.utils;
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
    const module = new Module(project.modulesPath, 'module-to-clone');
    await module.load();
    console.log('module:'.blue, module.file.dirname);

    const name = `test-clone-${Math.floor(Math.random() * 100)}`;
    console.log('cloning to:'.blue, name);
    const current = module.file.dirname;
    const toCreate = require('path').join(project.modulesPath, name);

    try {
        if (!await fs.exists(current)) {
            console.error({error: true, code: 'FILE_NOT_FOUND'})
            console.log({error: true, code: 'FILE_NOT_FOUND'});
        }
        await fs.copy(current, toCreate);

        const cloned = new Module(project.modulesPath, name);
        await cloned.load();
        await cloned.save({name});

        console.log(`module ${name}`.green, 'cloned!'.green);
    }
    catch (e) {
        console.error(e);
    }
})();
