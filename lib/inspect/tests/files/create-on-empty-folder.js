/**
 *
 * @type {string}
 */
const path = '../../../lib/dashboard/libraries/dashboard/service/builder/models';
(async () => {
    require('../../../lib/global');
    /**
     * Instance the template objects with a path
     */
    require(`${path}/templates`).get('../../../lib/templates');

    const {Server, Project} = (require(`${path}`));
    const projectsPath = './empty-folder';
    const server = new Server(projectsPath);
    const project = new Project(projectsPath);
    await project.create('web', {
        port: '4050',
        name: 'test03',
        title: 'Swiper example app',
        description: 'Swiper example app',
    });
    server.addProject(project.relativePath())
    console.log("ready")
})();
