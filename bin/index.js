#!/usr/bin/env node

const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');
require('colors');

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

    constructor() {
        const usage = '$ beyond engine --workspace=[port number]';

        yargs(hideBin(process.argv))
            .usage(usage)
            .command('engine', 'Start the BeyondJS engine', yargs => {
                yargs.positional('workspace', {
                    type: 'number',
                    describe: 'The port on which the http workspace will work'
                });
            }, argv => {
                new (require('beyond'))(argv.port);
            })
            .option('verbose', {
                alias: 'v',
                type: 'boolean',
                description: 'Run with verbose logging'
            })
            .parse();
    }
}
