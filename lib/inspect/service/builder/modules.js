require('colors');
const p = require('path');
module.exports = function (ipc) {
    const getPath = async (applicationId) => {
        let appData = await ipc.exec('applications/get', [applicationId]);
        appData = appData[applicationId];
        return appData.path;
    };

    this.create = async params => {
        try {
            const {projectId} = params;

            const projectPath = await getPath(projectId);

            const {Project, Module} = (require('./models'));

            const project = new Project(projectPath);
            await project.load();
            const isLayout = !!params.bundles.includes('layout');
            const name = isLayout ? `layouts/${params.name}` : params.name;
            const module = new Module(p.join(project.modules.path, name));

            if (module.exists) {
                return {status: 'ok', error: 'The module already exists'};
            }

            await module.load();

            await module.create(params);
            const path = p.join(project.modules.path, 'node_modules', `@${project.scope}`, project.name);
            const target = p.join(path, isLayout ? 'layout' : '', `${params.name}.d.ts`);
            await project._fs.mkdir(path, {recursive: true});
            await module._fs.save(target, '');

            return {status: 'ok', data: true};
        }
        catch (exc) {
            console.error(exc);
            return {error: exc.message};
        }
    };

    this.clone = async params => {
        const {fs} = global.utils;
        const appId = params.moduleId.split('//')[1];
        let application = await ipc.exec('applications/get', [appId]);
        application = application[appId];

        let module = await ipc.exec('modules/get', [params.moduleId]);
        module = module[params.moduleId];

        const current = module.path;
        const toCreate = p.join(application.modulesPath, params.name);
        try {
            if (!await fs.exists(current)) {
                console.error({error: true, code: 'FILE_NOT_FOUND'})
                return {error: true, code: 'FILE_NOT_FOUND'};
            }

            await fs.copy(current, toCreate);

            const {Module} = (require('../builder/models'));
            const module = new Module(toCreate);
            await module.save({name: params.name});

            return {status: true};
        }
        catch (e) {
            return {error: true, code: e};
        }
    };

    this.edit = async params => {
        try {

            const id = params.id || params.moduleId;
            if (!id) {
                return {status: false, error: 'the "id" param is required'};
            }
            let data = await ipc.exec('modules/get', [id]);
            data = data[id];
            const {Module} = (require('./models'));
            const module = new Module(data.path);
            await module.load();

            if (params.static) {
                const includes = module.static?.includes ? module.static.includes : [];
                !includes.includes(params.static.path) && (params.static = {includes: [params.static.path]});
            }

            delete params.moduleId;
            await module.save(params);
            return {status: true, data}
        }
        catch (e) {
            console.error(e);
            return {status: false, error: e.message};
        }

    };

    this.addBundle = async params => {
        try {
            let data = await ipc.exec('modules/get', [params.moduleId]);
            data = data[params.moduleId];
            const {Module} = (require('./models'));
            const module = new Module(data.path);
            await module.load();
            await module.bundles.add(params);
            await module.bundles.build();
            await module.save();
            return {status: 'ok', data: true};
        }
        catch (e) {
            return {status: false, error: e.message};
        }
    };

    this.install = async params => {
        if (!Array.isArray(params)) return {error: 'PARAMS_NOT_VALID'};

        const dependencies = params.join(', ');
        return new Promise((resolve, reject) => {
            const {exec} = require('child_process');
            exec('npm install', {
                cwd: dependencies
            }, (error, stdout, stderr) => {
                error && console.error("error", error);
                stderr && console.error("stderr", stderr);
                resolve();
            });
        });
    };
}
