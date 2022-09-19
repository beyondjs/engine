const {fs} = global.utils;
module.exports = function (parent) {
    /**
     * Remove file or all files and directories of a target folder
     * @param params
     * @returns {Promise<{status: boolean}|{code: string, error: boolean}|{error}>}
     */
    parent.delete = async function (params) {
        try {
            if (!await fs.exists(params.target)) {
                console.error({error: true, code: 'FILE_NOT_FOUND'})
                return {error: true, code: 'FILE_NOT_FOUND'};
            }

            await fs.unlink(params.target);
            return {status: true};
        }
        catch (e) {
            return {error: e};
        }
    };
}