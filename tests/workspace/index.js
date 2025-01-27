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
		console.log(`  (${pkg.modules.size} Modules found)`);

		for (const module of pkg.modules.values()) {
			await module.ready;
			console.log('  • Module:', module.id, module.platforms);
		}
	}

	console.log('End!');
})().catch(exc => console.error(exc));
