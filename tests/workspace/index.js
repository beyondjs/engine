const Workspace = require('beyond/workspace');
const { join } = require('path');

const path = join(__dirname, 'files');
const workspace = new Workspace(path);

(async () => {
	await workspace.packages.ready;
	console.log(workspace.packages);
})().catch(exc => console.error(exc));
