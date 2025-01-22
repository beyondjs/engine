require('./lib/global');
Error.stackTraceLimit = Infinity;

const args = (() => {
	const argv = process.argv.slice(2);
	const args = new Map();
	while (argv.length) {
		const [name, value] = argv.splice(0, 2);
		args.set(name.slice(2), value);
	}
	return args;
})();

const inspect = (() => {
	if (!args.has('inspector')) return;
	const inspector = parseInt(args.get('inspector'));
	return Number.isInteger(inspector) ? inspector : void 0;
})();

new (require('beyond'))({ inspect });
