require('./global');
const config = JSON.parse(process.argv[2]);

process.title = `BeyondJS HTTP client${config.dashboard ? ' - dashboard' : ''}`;

const core = new (require('./core'))(config.dirname, config.dashboard);
const http = new (require('./http'))(core);
http.initialise();

// Expose interprocess communication actions
require('./ipc')(core, http);
