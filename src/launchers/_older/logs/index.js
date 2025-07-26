const ipc = require('@beyond-js/ipc/main');

ipc.handle('bee.log', message => ipc.notify('bee.log', message));
