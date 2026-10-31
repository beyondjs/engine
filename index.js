// `--host <address>` opens the servers to that address instead of loopback; read before the globals
// are set up, and inherited by the forked processes through the environment
const host = process.argv.indexOf('--host');
if (host !== -1 && process.argv[host + 1]) process.env.BEYOND_HOST = process.argv[host + 1];
// `--port <port>` (or `--port <distribution>=<port>,…`) gives the distributions' servers that port instead of
// their package file's; read the same way, and inherited by the forked processes as `BEYOND_PORT`
const port = process.argv.indexOf('--port');
if (port !== -1 && process.argv[port + 1]) process.env.BEYOND_PORT = process.argv[port + 1];

require('./lib/global');

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

// A port that cannot be used stops Engine before any server or process starts
try {
	global.utils.ports.assignment;
} catch (exc) {
	if (exc.code !== 'INVALID_PORT') throw exc;
	console.error(exc.message);
	process.exit(1);
}

new (require('beyond'))({ inspect });
