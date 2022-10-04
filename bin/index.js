#!/usr/bin/env node

module.exports = new class {
    #start(argv) {
        const {workspace, repository} = argv;
        new (require('beyond'))(new Map(Object.entries({workspace, repository})));
    }

    constructor() {
        const usage = 'Usage: $0 <command> [options]';

        void require('yargs')
            .scriptName('beyond')
            .usage(usage)
            .command('run [workspace] [repository]', 'Execute the BeyondJS packages engine.', yargs => {
                yargs.positional('workspace', {
                    type: 'number',
                    default: 4000,
                    optional: true,
                    describe: 'The inspection port required by the workspace to connect with the engine'
                })
                yargs.positional('repository', {
                    type: 'number',
                    required: true,
                    optional: true,
                    default: 8080,
                    describe: 'The port on which the packages repository will work'
                })
            }, this.#start)
            .help()
            .demandCommand(1, 'You need to set a command to run BeyondJS'.red)
            .argv;
    }
}
