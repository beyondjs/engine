module.exports = function (parent) {
    /**
     * Rename filename
     * @param params
     * @returns {Promise<{status: boolean}|{code: string, error: boolean}|{error}>}
     */
    parent.rename = async function (params) {
        const fs = global.utils.fs;
        const current = `${params.path}\\${params.current}`;
        const rename = `${params.path}\\${params.newName}`;

        try {
            if (!await fs.exists(current)) {
                console.error({error: true, code: 'FILE_NOT_FOUND'})
                return {error: true, code: 'FILE_NOT_FOUND'};
            }

            await fs.copyFile(current, rename);
            await fs.rm(current);
            return {status: true};
        }
        catch (e) {
            return {error: e};
        }
    };
}