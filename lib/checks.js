const ports = require('@beyond-js/ports');
require('colors');

module.exports = async function (args) {
    const port = async arg => {
        if (!args.has(arg)) return {};
        const value = parseInt(args.get(arg));
        if (!Number.isInteger(value)) return {error: `The port specified to the ${arg} is undefined or invalid.`};

        return await ports.check(value) ? {value} :
            {error: `The port "${value}" that is assigned to the ${arg} is already in use.`};
    }

    const inspect = await port('workspace');
    const repository = await port('repository');

    const message = error => 'Cannot run BeyondJS: '.red + (error ? error.red : '');

    if (inspect.error || repository.error) {
        console.log(message());
        inspect.error && console.log('  * ' + inspect.error.red);
        repository.error && console.log('  * ' + repository.error.red);
        return {valid: false};
    }
    if (!repository.value) {
        console.log(message('Repository port must be specified.'));
        return {valid: false};
    }

    if (repository.value === inspect.value) {
        console.log(message('Repository and workspace ports cannot be the same.'));
        return {valid: false};
    }

    return {valid: true, inspect: inspect.value, repository: repository.value};
}
