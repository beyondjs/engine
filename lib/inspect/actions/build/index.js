module.exports = async function (params) {
    return await global.utils.ipc.exec('engine', 'applications/build', params);
}