require('./lib/global');

const args = (() => {
    const argv = process.argv.slice(2);
    const args = new Map();
    while (argv.length) {
        const [name, value] = argv.splice(0, 2)
        args.set(name.slice(2), value);
    }
    return args;
})();

const workspace = (() => {
    if (!args.has('workspace')) return;
    const workspace = parseInt(args.get('workspace'));
    return Number.isInteger(workspace) ? workspace : void 0;
})();

const repository = (() => {
    if (!args.has('repository')) return 8080;
    const repository = parseInt(args.get('repository'));
    return Number.isInteger(repository) ? repository : void 0;
})();

new (require('beyond'))(new Map(Object.entries({workspace, repository})));
