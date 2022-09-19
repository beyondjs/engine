module.exports = async function (model, params) {
    if (params.path) return params.path;

    let data = await global.utils.ipc.exec(model.monitor, model.action, [params.id]);
    if (!data) return false;

    if (params.type === 'template-processors') {
        const items = [...data.values()].find(i => i.hasOwnProperty(params.id))
        return items[params.id].path;
    }

    data = data[params.id];
    if (!data) return false;

    if (params.type === 'backend') {
        return data.backend;
    }

    //if identifier is "core" or "sessions"
    if (params.type === 'bee' && params.identifier) {
        return data[params.identifier];
    }

    return data.path;
};