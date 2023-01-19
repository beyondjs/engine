require('colors');
const {resolve, join} = require('path');
const service = new (require('beyond/inspect-service'))();

module.exports = () => {
    const fields = [
        {
            type: 'input',
            name: 'specifier',
            prefix: '',
            message: 'Package specifier:'.cyan
        },
        {
            type: 'input',
            name: 'title',
            prefix: '',
            message: 'Title:'.cyan
        },
        {
            type: 'input',
            name: 'description',
            prefix: '',
            message: 'About:'.cyan
        },
        {
            type: 'list',
            name: 'type',
            prefix: '',
            message: 'Package type:'.cyan,
            choices: ['web', 'backend', 'node', 'express', 'react', 'svelte', 'vue', 'web-backend', 'empty']
        },
        {
            type: 'confirm',
            name: 'npm',
            prefix: '',
            message: 'Do you want to install your package dependencies?'.cyan,
            default: false
        }
    ];
    require('inquirer').prompt(fields).then(async specs => {
        let {specifier} = specs;
        const withScope = specifier.startsWith('@') && !/@[\w-]+\/[\w-.]+/.test(specifier);

        if (withScope || !/[\w-.]+/.test(specifier)) {
            console.log(`The project identifier must have the following structure:
             "@scope/package-name" or "package-name"`);
            return;
        }

        delete specs.specifier;
        if (!specifier.includes("@")) specs.name = specifier;
        else {
            const [scope, name] = specifier.split('/');
            specs.scope = scope.replace('@', '');
            specs.name = name;
        }

        specs.cwd = resolve(process.cwd());
        const {project} = service.builder;

        console.log('Building your package...');
        specs.npm && console.log('Installing your package dependencies...');
        await project.create(specs);
        console.log(`Package "${specifier}"`, `created`.green, `at:`, join(specs.cwd, specs.name));
    });
}