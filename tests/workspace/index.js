const Workspace = require('beyond/workspace');
const { join } = require('path');

const path = join(__dirname, 'files');
const workspace = new Workspace(path);

(async () => {
	await workspace.packages.ready;
	console.log('Packages found:');

	for (const [id, pkg] of workspace.packages) {
		await pkg.ready;
		console.log('•', id, pkg.name);

		await pkg.modules.ready;
		console.log('  Modules found:', pkg.modules.size);
		pkg.modules.forEach(module => console.log('  • Module:', module.ready));
	}

	console.log('End!');
})().catch(exc => console.error(exc));
