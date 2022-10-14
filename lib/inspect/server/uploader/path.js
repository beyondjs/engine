module.exports = async function ({id, type}) {
    if (type === 'overwrite') {
        //TODO @ftovar validar cuando el boton funcione, que se pase bien el formato
        // id del overwrite = appId//moduleName
        id = id.replace('application//', '');
    }

    const items = await global.utils.ipc.exec(`engine`, `${type}s/get`, [id]);
    if (!Object.keys(items).length) return;
    return items[id].path;
}