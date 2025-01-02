require('colors');
const { join, sep } = require('path');
const fs = require('@beyond-js/fs');
const crc32 = require('@beyond-js/crc32');
const ports = require('@beyond-js/ports');

const projects = new Map();
module.exports = function (ipc) {
	const { Project } = require('./models');

	this.validate = async params => {
		const { cwd, projectId } = params;
		const path = cwd ?? (await getPath(projectId));

		const project = new Project(path);
		await project.load();

		if (!project._exists) return { status: 'ok', error: 'package.json file not found' };
		return { status: 'ok', data: { id: crc32(path) } };
	};

	this.create = async params => {
		try {
			let { name } = params;
			if (name.includes('@')) [, name] = name.split('/');
			const wd = params.cwd ? params.cwd : ipc.wd;
			const dirname = join(wd, name);

			if (await fs.exists(dirname)) {
				return { status: false, error: `APP_EXISTS` };
			}

			if (!params.backend) delete params.backend;
			const project = new Project(dirname, params);
			const response = await project.create(params.type, params);
			if (response?.error) return response;

			//- params.cwd is passed if executed from the CLI
			const server = await ipc.getServer(params.cwd);

			let relativePath = project.file.file.replace(wd, '');
			if (sep !== '/') relativePath = relativePath.replace(/\\/g, '/');

			await server.load();
			await server.addProject(relativePath);
			server.save();

			const applicationId = crc32(project.file.dirname);
			return { status: true, data: { id: applicationId } };
		} catch (exc) {
			return { status: false, error: exc.message };
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
			const project = new Project(path);
			projects.set(id, project);
		}
		return projects.get(id);
	};

	/**
	 *  Checks if the folder where files going to be located exist.
	 * @param params
	 * @returns {Promise<void>}
	 */
	this.checkStatic = async params => {
		const project = await getProject(params.applicationId);
		await project.load();

		if (!project.static) project.static = { includes: [] };
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
				return { status: 'error', error: response.error };
			}
			return project.save();
		} catch (e) {
			return { status: 'error', error: e.message };
		}
	};

	this.edit = async params => {
		const project = await getProject(params.applicationId);
		return project.save(params);
	};

	this.backend = async params => {
		const project = await getProject(params.applicationId);
		return project.backend.create();
	};

	this.checkPort = async params => {
		if (!params.port) {
			return { status: false, error: 'PORT_REQUIRED' };
		}

		const available = await ports.check(params.port);
		return { status: true, valid: available };
	};
};
