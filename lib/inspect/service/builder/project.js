require('colors');
const {join, sep} = require('path');
const {ports, fs, crc32} = global.utils;

const projects = new Map();
module.exports = function (ipc) {
    const {Project} = (require('./models'));

    this.create = async params => {
        try {
            const server = await ipc.getServer();

            const dirname = join(ipc.wd, params.name);
            if (await fs.exists(dirname)) {
                return {status: false, error: `APP_EXISTS`};
            }

            if (!params.backend) delete params.backend
            const project = new Project(dirname, params);
            await project.create(params.type, params);
            let relativePath = project.file.file.replace(ipc.wd, '');

            if (sep !== '/') relativePath = relativePath.replace(/\\/g, '/');
            await server.addProject(relativePath);
            const applicationId = crc32(project.file.dirname);

            server.save();
            return {status: true, data: {id: applicationId}};
        }
        catch (exc) {

            return {status: false, error: exc.message}
        }
    };

    const getPath = async applicationId => {
        const appData = await ipc.exec('applications/get', [applicationId]);
        return appData[applicationId].path;
    };

    const getProject = async id => {
        if (!id) throw Error('The application id is necessary');
        if (!projects.has(id)) {
            const path = await getPath(id);
            const project = new Project(path)
            projects.set(id, project);
        }
        return projects.get(id);

    }

    /**
     *  Checks if the folder where files going to be located exist.
     * @param params
     * @returns {Promise<void>}
     */
    this.checkStatic = async params => {
        const project = await getProject(params.applicationId);
        await project.load();

        if (!project.static) project.static = {includes: []};
        if (!Array.isArray(project.static.includes)) {
            throw 'La entrada includes no es un array';
        }

        if (!project.static.includes.includes(params.static.path)) {
            project.static.includes.push(params.static.path);
        }
        project.save();
    };

    this.setDistribution = async params => {
        try {
            const project = await getProject(params.applicationId);
            await project.load();
            const response = await project.deployment.setDistribution(params.distribution);
            if (response.error) {
                return {status: 'error', error: response.error};
            }
            return project.save();
        }
        catch (e) {
            return {status: 'error', error: e.message};
        }

    }

    this.edit = async params => {
        const project = await getProject(params.applicationId);
        return project.save(params);
    };

    this.backend = async params => {
        const project = await getProject(params.applicationId);
        return project.backend.create();
    }

    this.checkPort = async params => {
        if (!params.port) {
            return {status: false, error: 'PORT_REQUIRED'};
        }

        const available = await ports.check(params.port);
        return {status: true, valid: available};
    }
}
