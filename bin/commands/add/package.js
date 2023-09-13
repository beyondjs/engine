require('colors');
const { resolve, join } = require('path');
const service = new (require('beyond/inspect-service'))();

module.exports = () => {
	const fields = [
		{
			type: 'input',
			name: 'specifier',
			prefix: '',
			message: 'Package specifier:'.cyan,
			validate(value) {
				if (!value.length) return 'Specifier cannot be empty. Please enter it correctly...';

				const withScope = value.startsWith('@') && !/@[\w-]+\/[\w-.]+/.test(value);
				if (withScope || !/[\w-.]+/.test(value)) {
					return `The package identifier must have the following structure: "@scope/package-name" or "package-name"`;
				}
				return true;
			},
		},
		{
			type: 'input',
			name: 'title',
			prefix: '',
			message: 'Title:'.cyan,
		},
		{
			type: 'input',
			name: 'description',
			prefix: '',
			message: 'About:'.cyan,
		},
		{
			type: 'list',
			name: 'type',
			prefix: '',
			message: 'Package type:'.cyan,
			choices: ['empty', 'web', 'backend', 'node', 'web-backend'],
		},
		{
			type: 'list',
			name: 'front',
			prefix: '',
			message: 'Package type:'.cyan,
			choices: ['react', 'svelte', 'vue'],
			when(answers) {
				return ['web'].includes(answers.type);
			},
		},
		{
			type: 'confirm',
			name: 'express',
			prefix: '',
			message: 'Do you want to add the express package?'.cyan,
			default: false,
			when(answers) {
				return ['node'].includes(answers.type);
			},
		},
		{
			type: 'confirm',
			name: 'npm',
			prefix: '',
			message: 'Do you want to install the package dependencies?'.cyan,
			default: false,
		},
	];

	const run = async specs => {
		let { specifier } = specs;
		specs.name = specifier;
		specs.cwd = resolve(process.cwd());

		// Validate the different types of packages according to the user's selection
		const { front, express } = specs;
		front && (specs.type = front);
		express && (specs.type = 'express');

		console.log('Building package...');
		specs.npm && console.log('Installing the package dependencies...');
		const { project } = service.builder;
		const response = await project.create(specs);

		if (!response.status) console.log(`Package "${specifier}"`, `not created. `.red, `Error: ${response.error}`);
		else console.log(`Package "${specifier}"`, `created`.green, `at:`, join(specs.cwd, specs.name));
	};
	require('inquirer').prompt(fields).then(run);
};
