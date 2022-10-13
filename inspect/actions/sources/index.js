module.exports = function (service) {
    this.save = (params, session) => service.sources.save(params, session);
    this.clone = (params, session) => service.sources.clone(params, session);
    this.rename = (params, session) => service.sources.rename(params, session);
    this.delete = (params, session) => service.sources.delete(params, session);
    this.format = (params, session) => service.sources.format(params, session);

    const getPath = require('./path');
    const actions = require('./actions')();
    this.create = async params => {
        const model = actions[params.type];
        if (!model) {
            return {error: `The type of application was not specified or not exists, action:"${params.type}"`};
        }

        const split = params.filename.split('/');
        let pathname = '';
        let filename = params.filename;
        if (split.length > 1) {
            filename = split.pop();
            pathname = split.join('/');
        }

        let path = await getPath(model, params);
        if (!path) return {error: `params not valid to create file`};

        path = pathname ? `${path}\\${pathname}` : path;
        return service.sources.create({path: path, filename: filename});
    };
};
