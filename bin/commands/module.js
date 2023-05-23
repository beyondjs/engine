require('colors');
const {resolve} = require('path');
const service = new (require('beyond/inspect-service'))();

module.exports = async () => {
    const {project} = service.builder;
    const response = await project.validate({cwd: resolve(process.cwd())});
    if (response.error) {
        console.log(`${response.error}`.red);
        return;
    }

    const fields = [
        {
            type: 'input',
            name: 'name',
            prefix: '',
            message: 'Package subpath:'.cyan,
            validate(value) {
                return value.length ? true : 'It cannot be empty. Please enter it correctly...';
            }
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
            },
            validate(value) {
                if (!value) return 'It cannot be empty. Please enter it correctly...';

                const error = 'The web component name must be has the next structure: "web-component"';
                return !value.match(/[a-z]+-[a-z]+/g) ? error : true;
            }
        },
        {
            type: 'input',
            name: 'route',
            prefix: '',
            message: 'Page URL:'.cyan,
            when(answers) {
                return answers.bundles === 'page';
            },
            validate(value) {
                return value.length ? true : 'It cannot be empty. Please enter it correctly...';
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
            when(answers) {
                const bundles = ['bridge', 'ts', 'start'];
                return !bundles.includes(answers.bundles);
            },
            default: false
        },
        {
            type: 'confirm',
            name: 'multilanguage',
            prefix: '',
            message: 'Multilanguage?'.cyan,
            when(answers) {
                const bundles = ['bridge', 'ts', 'start'];
                return !bundles.includes(answers.bundles);
            },
            default: false
        }
    ];
    require('inquirer').prompt(fields).then(async specs => {
        specs.cwd = resolve(process.cwd());

        specs.bundles = [specs.bundles];
        specs.processors = ['ts'];
        specs.styles && specs.processors.push('sass');
        if (specs.route && !specs.route.startsWith('/')) {
            specs.route = `/${specs.route}`;
        }

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