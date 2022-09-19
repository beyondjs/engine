const {ipc} = global.utils;

module.exports = function (project, message) {
    ipc.exec('main', 'bee.log', {application: project.id, message});
    console.log('Bee error', message);
}
