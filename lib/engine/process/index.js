require('./global');
const config = JSON.parse(process.argv[2]);

process.title = 'BeyondJS Engine Forked Process';
// Ends with the main process, whatever ended it: an orphaned compiler would keep its port and its cache
process.once('disconnect', () => process.exit(0));

const core = new (require('./core'))(config.dirname);
const http = new (require('./http'))(core, {inspect: config.inspect});
http.initialise();

// Expose interprocess communication actions
require('./ipc')(core, http);
