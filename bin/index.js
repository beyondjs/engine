#!/usr/bin/env node
require('colors');
require('../lib/global');
const {ports} = global.utils;

module.exports = new class {
    #engine;
    get engine() {
        return this.#engine;
    }

    #inspect;
    get inspect() {
        return this.#inspect;
    }

    #launchers;
    get launchers() {
        return this.#launchers;
    }

    #start(argv) {
        const done = ({error, params}) => {
            if (error) {
                console.log('Cannot run BeyondJS: '.red, error);
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
                    done({error: `Workspace port ${workspace} is already in use`})
                )
                .catch(exc => done(exc.message));
        }
        else {
            done({});
        }
    }

    constructor() {
        const usage = 'Usage: $0 <command> [options]';

        require('yargs')
            .scriptName('beyond')
            .usage(usage)
            .command('run [workspace]', 'Welcome to BeyondJS', yargs => {
                yargs.positional('workspace', {
                    type: 'number',
                    default: 4000,
                    describe: 'The port on which the http workspace will work'
                })
            }, this.#start)
            .help()
            .demandCommand(1, 'You need to set a command to run BeyondJS'.red)
            .argv;
    }
}
