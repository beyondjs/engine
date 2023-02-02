require('colors');
require('../../lib/global');
const {ports} = global.utils;

const start = argv => {
    const done = ({error, params}) => {
        if (error) {
            console.log('Cannot run BeyondJS:'.red, error);
            return;
        }

        params = params ? params : {};
        new (require('beyond'))(params);
    }

    const {workspace} = argv;
    if (workspace) {
        ports.check(workspace)
            .then(ok => ok ?
                        done({params: {inspect: workspace}}) :
                        done({error: `Workspace port ${workspace} is already in use, add --workspace [value] to define a specific port`})
            )
            .catch(exc => done(exc.message));
    }
    else {
        done({});
    }
}

module.exports = {
    command: 'run [workspace]',
    description: 'Run the BeyondJS packages engine and server',
    options: [{
        name: 'workspace',
        type: 'number',
        default: 4000,
        optional: true,
        describe: 'The port on which the http workspace will work'
    }],
    handler: start
}
