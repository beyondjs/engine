process.title = 'BeyondJS files watchers monitor';

const ipc = (require('../../utils/ipc'));
const watchers = new (require('./watchers'));

ipc.handle('create', params => watchers.create(params.container));
ipc.handle('delete', async params => await watchers.delete(params.id));

ipc.handle('listeners.create', params => {
    if (!params) throw new Error(`Invalid parameters`);
    if (!params.watcher) throw new Error(`Watcher parameter not defined`);
    if (!watchers.has(params.watcher)) throw new Error(`Watcher ${params.watcher} is not registered`);

    const watcher = watchers.get(params.watcher);
    const listener = watcher.listeners.create(params.watcher, params.path, params.filter);

    return listener.id;
});

ipc.handle('listeners.delete', params => {
    if (!params) throw new Error(`Invalid parameters`);
    if (!params.watcher) throw new Error(`Watcher parameter not defined`);
    if (!params.id) throw new Error(`Listener parameter not defined`);
    if (!watchers.has(params.watcher)) throw new Error(`Watcher ${params.watcher} is not registered`);

    const watcher = watchers.get(params.watcher);
    watcher.listeners.stop(params.id);
});
