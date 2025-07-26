const path = '../../../../lib/dashboard/libraries/dashboard/service/builder/models';
(async () => {
    require('../../../../lib/global');
    const {Server} = require(`${path}/`);
    const Templates = require(`${path}/templates`);
    const templates = Templates.get('../../../lib/templates');
    const wd = require('path').join(process.cwd());
    const model = new Server(wd);
    try {
        await model.load();
        // await model.projects.add('test22/application.json');
        await model.projects.add('test2212/algo/application.json');
        model.addProject('test/algo/algo.json')
    }
    catch (e) {
        console.error(e);
    }

    // await model.addApplication('test11s/application.json');

    console.log("ready", templates.path)
})();
