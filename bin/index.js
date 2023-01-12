#!/usr/bin/env node

const commands = require('./commands');

const {version} = require('../package.json');

module.exports = new class {
    constructor() {
        const usage = 'Usage: $0 <command> [options]';

        const yargs = require('yargs')
            .scriptName('beyond')
            .version(version)
            .usage(usage)

        void commands.forEach(({command, description, options, positionals, handler}) => {
            yargs.command(
                command,
                description,
                yargs => {
                    options?.forEach(option => yargs.option(option.name, option));
                    positionals?.forEach(positional => yargs.positional(positional.name, positional));
                },
                handler
            );
        });

        void yargs.help()
            .demandCommand(1, 'You have to specify a command to run beyond')
            .argv;

    }
}
