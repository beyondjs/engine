const {ipc} = global.utils;
module.exports = async function ({id, type}) {
    if (type === 'overwrite') {
        //TODO @ftovar Once the button works, verify that the correct format is passed
        // overwrite id = appId//moduleName
        id = id.replace('application//', '');
    }

    const items = await ipc.exec(`main-client`, `${type}s/get`, [id]);

    if (!Object.keys(items).length) return
    return items[id].path;
}