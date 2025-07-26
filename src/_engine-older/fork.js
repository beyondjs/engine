require('./global');
const config = JSON.parse(process.argv[2]);

process.title = 'BeyondJS Engine Forked Process';

const core = new (require('./core'))(config.dirname);
const http = new (require('./http'))(core, {inspect: config.inspect});
http.initialise();

// Expose interprocess communication actions
require('./ipc')(core, http);
