#!/usr/bin/env node
const commands = require('./commands');

module.exports = new class {
    constructor() {
        const usage = 'Usage: $0 <command> [options]';

        const yargs = require('yargs')
            .scriptName('beyond')
            .usage(usage)

        commands.forEach(({command, description, options, handler}) => {
            yargs.command(
                command,
                description,
                yargs => options?.forEach(option => yargs.positional(option.name, option)),
                handler
            );
        });

        void yargs.help()
            .demandCommand(1, 'You need to set a command to run BeyondJS'.red)
            .argv;

    }
}
