const Module = require('module');
const {ipc} = global.utils;

/**
 * Retrieves, compiles / executes the project configuration code (config.js)
 * @param bee
 * @return {Promise<void>}
 */
module.exports = async function (bee) {
    const log = ({errors, exc}) => {
        console.error(`Error loading project configuration`, errors, exc?.stack);
        require('../log')(bee.project, {
            type: 'config.error',
            errors: errors,
            exc: exc instanceof Error ? exc.beyond : void 0
        });
    }

    try {
        const {project, distribution} = bee.specs;
        const {code, errors} = await ipc.exec('main-client', 'code/config/get', project.id, distribution);
        if (errors?.length) return log({errors});

        const compiled = new Module('config');
        try {
            compiled._compile(code, `/node_modules/config.js`);
        }
        catch (exc) {
            log({errors: ['Error compiling project configuration'], exc});
        }
    }
    catch (exc) {
        log({errors: ['Error found loading project configuration'], exc});
    }
}
