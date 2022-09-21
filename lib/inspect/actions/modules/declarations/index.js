module.exports = function () {
    this.update = params => global.utils.ipc.exec('engine', 'modules/declarations/update', {id: params.id});
}