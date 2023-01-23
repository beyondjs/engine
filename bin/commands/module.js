require('colors');
const {join, resolve} = require('path');
const service = new (require('beyond/inspect-service'))();

module.exports = () => {
    const fields = [
        {
            type: 'input',
            name: 'name',
            prefix: '',
            message: 'Package subpath:'.cyan
        },
        {
            type: 'list',
            name: 'bundles',
            prefix: '',
            message: 'Module type:'.cyan,
            choices: ['page', 'widget', 'layout', 'code', 'bridge', 'ts', 'start']
        },
        {
            type: 'input',
            name: 'element.name',
            prefix: '',
            message: 'Web component name:'.cyan,
            when(answers) {
                return ['page', 'widget', 'layout'].includes(answers.bundles);
            }
        },
        {
            type: 'input',
            name: 'route',
            prefix: '',
            message: 'Page URL:'.cyan,
            when(answers) {
                return answers.bundles === 'page';
            }
        },
        {
            type: 'input',
            name: 'description',
            prefix: '',
            message: 'About:'.cyan
        },
        {
            type: 'confirm',
            name: 'styles',
            prefix: '',
            message: 'Styles?'.cyan,
            default: false
        },
        {
            type: 'confirm',
            name: 'multilanguage',
            prefix: '',
            message: 'Multilanguage?'.cyan,
            default: false
        }
    ];
    require('inquirer').prompt(fields).then(async specs => {
        specs.cwd = resolve(process.cwd());

        specs.bundles = [specs.bundles];
        specs.processors = ['ts'];
        specs.styles && specs.processors.push('sass');

        const {modules} = service.builder;
        console.log('Building module...');

        const response = await modules.create(specs);
        if (response.error) {
            console.log(`Module not created:`.red, response.error);
            return;
        }
        console.log(`Module "${specs.name}"`, `created successfully`.green);
    });
}