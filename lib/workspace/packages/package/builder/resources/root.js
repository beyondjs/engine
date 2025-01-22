const p = require('path');
const fs = require('@beyond-js/fs');
const EXCLUDES = ['.gitignore', 'package.json', 'package-lock.json'];

module.exports = async function (builder, path) {
	builder.emit('message', 'Copying resources from the root folder');

	const { package: pkg } = builder;
	const files = await fs.readdir(pkg.path, { withFileTypes: true });

	const promises = [];
	files.forEach(file => {
		if (file.isDirectory() || EXCLUDES.includes(file.name)) return;
		const filePath = p.join(pkg.path, file.name);

		if (file.name === '.env') return;
		const target = p.join(path, file.name);
		builder.emit('message', `Copying file: "${file.name}"`);
		promises.push(fs.copyFile(filePath, target));
	});
	await Promise.all(promises);
};
