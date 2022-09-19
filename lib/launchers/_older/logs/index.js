const {ipc} = global.utils;

ipc.handle('bee.log', message => ipc.notify('bee.log', message));
