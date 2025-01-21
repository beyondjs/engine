const p = require('path');
const {
	utils: { fs },
	platforms: { webAndMobile }
} = global;

/*
 Generate widgets static resources
 */
module.exports = async function (builder, distribution, paths) {
	const { package: pkg } = builder;
	await pkg.widgets.ready;

	if (!webAndMobile.includes(distribution.platform)) return;

	if (!pkg.widgets.size) return;
	builder.emit('message', 'Building widgets static resources external resources');

	const folder = p.join(paths.www, '__sr_widgets__');
	await fs.mkdir(folder, { recursive: true });

	const promises = [];
	for (const [key, widget] of pkg.widgets) {
		const processed = await pkg.widgets.process(key, distribution);
		const content = JSON.stringify(processed);

		if (processed.errors) {
			builder.emit('error', `  .${processed.errors.join(`\n`)}`);
			continue;
		}

		builder.emit('message', `Building ${widget.resource} resource.`);
		const target = p.join(folder, `${key}`);
		promises.push(fs.save(target, content));
	}
	await Promise.all(promises);
};
