const {ipc} = global.utils;

// Cache of application ids from application paths to avoid duplicated IPC calls
const ids = new Map();

/**
 * Returns the application object from its id
 * @param model {object}
 * @param applicationId {number}
 * @return {Promise<void>}
 */
module.exports = async function (model, applicationId) {
    if (typeof applicationId !== 'number') throw new Error('Invalid parameters');

    const path = ids.has(applicationId) ? ids.get(applicationId) : await ipc.exec('main', 'ids.path/get', applicationId);
    ids.set(applicationId, path);
    if (!path) throw new Error(`Path of application ${applicationId} not found`);

    // Getting the application object
    const {applications} = model;
    await applications.ready;
    if (!applications.has(path)) throw new Error(`Application "${path}" - "${applicationId}" not found`);

    const application = applications.get(path);
    await application.ready;
    return application;
}
