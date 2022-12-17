require('./global');
const config = JSON.parse(process.argv[2]);

const uimport = require('@beyond-js/uimport');
uimport.initialise();

process.title = 'BeyondJS Engine Forked Process';

const core = new (require('./core'))(config.dirname);
const http = new (require('./http'))(core, {inspect: config.inspect, repository: config.repository});
http.initialise();

// Expose interprocess communication actions
require('./ipc')(core, http);
