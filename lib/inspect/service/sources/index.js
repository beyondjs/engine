module.exports = function () {

    new (require('./save'))(this);
    new (require('./rename'))(this);
    new (require('./delete'))(this);
    new (require('./format'))(this);

    this.create = async (specs) => {
        const {path, filename} = specs;
        try {
            if (!specs.path) {
                return {error: `Path not valid: "${specs.path}"`};
            }
            if (!specs.filename) {
                return {error: `filename not valid: "${specs.filename}"`};
            }

            const {fs} = global.utils;
            const dest = require('path').join(path, filename);
            await fs.save(dest, '//your code here');

            return {status: true};
        }
        catch (exc) {
            console.error(exc);
            return {error: true, data: exc};
        }
    };
}
