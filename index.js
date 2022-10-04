const args = (() => {
    const argv = process.argv.slice(2);
    const args = new Map();
    while (argv.length) {
        const [name, value] = argv.splice(0, 2)
        args.set(name.slice(2), value);
    }
    return args;
})();

new (require('beyond'))(args);
