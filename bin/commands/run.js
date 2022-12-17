const Engine = require('beyond');

module.exports = {
    command: 'run [workspace] [repository]',
    description: 'Run the BeyondJS packages engine and server',
    options: [{
        name: 'workspace',
        type: 'number',
        default: 4000,
        optional: true,
        describe: 'The inspection port required by the workspace to connect with the engine'
    }, {
        name: 'repository',
        type: 'number',
        required: true,
        optional: true,
        default: 8080,
        describe: 'The port on which the packages repository will work'
    }],
    handler: argv => {
        const {workspace, repository} = argv;
        new Engine(new Map(Object.entries({workspace, repository})));
    }
}
