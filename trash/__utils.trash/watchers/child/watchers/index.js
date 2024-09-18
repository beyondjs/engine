module.exports = new class {
    #watchers = new Map();

    get(container) {
        const {path} = container;
        const watchers = this.#watchers;

        if (watchers.has(path)) {
            const watcher = watchers.get(path);
            watcher.instances++;
            return watcher.value;
        }

        const watcher = new (require('./watcher.js'))(container);
        watchers.set(path, {instances: 1, value: watcher});
        return watcher;
    }

    unregister(container) {
        const {path} = container;
        const watchers = this.#watchers;

        if (!watchers.has(path)) {
            console.log(`Watcher "${path}" is already unregistered`);
            return;
        }

        const watcher = watchers.get(path);
        watcher.instances--;
        if (!watcher.instances) {
            watcher.value.stop().catch(exc => console.log(exc.stack));
            watchers.delete(path);
        }
    }
}
