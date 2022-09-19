module.exports = function (ipc) {
    const getPath = async applicationId => {
        const template = await ipc.exec('templates/get', applicationId);
        return template.path;
    };

    this.delete = async params => {
        const {Template} = (require('./models'));
        const path = await getPath(params.applicationId);
        const template = new Template(`${path}\\template.json`, path);

        await template.delete(params);
    };

    this.update = async params => {
        const {Template} = (require('./models'));
        const path = await getPath(params.applicationId);
        const template = new Template(`${path}\\template.json`, path);

        await template.save(params);
    };
}