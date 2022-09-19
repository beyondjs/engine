module.exports = function (parent) {
    parent.save = async function (params) {
        const fs = global.utils.fs;
        try {
            if (!await fs.exists(params.file)) {
                console.error({error: true, code: 'FILE_NOT_FOUND'})
                return {error: true, code: 'FILE_NOT_FOUND'};
            }

            await fs.save(params.file, params.source);
            return {status: true};
        }
        catch (e) {
            return {error: e};
        }
    };
}