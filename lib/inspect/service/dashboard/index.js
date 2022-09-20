const {fs} = global.utils;
const ipcManager = require('../ipc-manager');
module.exports = function () {
    const code = 'b3d421';

    this.validate = params => params?.hash?.toUpperCase() === code.toUpperCase();

    this.cleanCache = async () => {
        try {
            const path = require('path').join(ipcManager.wd, '.beyond');
            if (!await fs.exists(path)) return {status: true};
            await fs.promises.rmdir(path, {recursive: true});
            return {status: true}
        }
        catch (e) {
            return {status: false, error: e};
        }
    }

    this.getWD = async () => {
        try {
            const wd = await ipcManager.getWd();
            return {
                status: true,
                data: {wd}
            }
        }
        catch (e) {
            return {status: false, error: e};
        }
    }
}
