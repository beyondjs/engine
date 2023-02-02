require('colors');
const {resolve, join} = require('path');
const service = new (require('beyond/inspect-service'))();

module.exports = () => {
    const fields = [
        {
            type: 'input',
            name: 'specifier',
            prefix: '',
            message: 'Package specifier:'.cyan,
            validate(value) {
                return value.length ? true : 'Specifier cannot be empty. Please enter it correctly...';
            }
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
            choices: ['empty', 'web', 'backend', 'node', 'web-backend']
        },
        {
            type: 'list',
            name: 'front',
            prefix: '',
            message: 'Package type:'.cyan,
            choices: ['react', 'svelte', 'vue'],
            when(answers) {
                return ['web'].includes(answers.type);
            }
        },
        {
            type: 'confirm',
            name: 'express',
            prefix: '',
            message: 'Do you want to add the express package?'.cyan,
            default: false,
            when(answers) {
                return ['node'].includes(answers.type);
            }
        },
        {
            type: 'confirm',
            name: 'npm',
            prefix: '',
            message: 'Do you want to install the package dependencies?'.cyan,
            default: false
        }
    ];
    require('inquirer').prompt(fields).then(async specs => {
        let {specifier} = specs;
        const withScope = specifier.startsWith('@') && !/@[\w-]+\/[\w-.]+/.test(specifier);
        if (withScope || !/[\w-.]+/.test(specifier)) {
            console.log(`The package identifier must have the following structure: 
            "@scope/package-name" or "package-name"`);
            return;
        }

        if (!specifier.includes("@")) specs.name = specifier;
        else {
            const [scope, name] = specifier.split('/');
            specs.scope = scope.replace('@', '');
            specs.name = name;
        }

        specs.cwd = resolve(process.cwd());

        // Validate the different types of packages according to the user's selection
        const {front, express} = specs;
        front && (specs.type = front);
        express && (specs.type = 'express');

        console.log('Building package...');
        specs.npm && console.log('Installing the package dependencies...');
        const {project} = service.builder;
        await project.create(specs);
        console.log(`Package "${specifier}"`, `created`.green, `at:`, join(specs.cwd, specs.name));
    });
}