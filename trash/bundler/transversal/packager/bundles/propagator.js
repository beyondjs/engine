module.exports = class {
    #listeners = new Map();

    constructor(emitter) {
        const events = ['js.change', 'css.change', 'hash.change',
            'dependencies.change', 'dependencies.hash.change', 'dependency.change'];
        events.forEach(event => this.#listeners.set(event, (...params) => emitter.emit(event, ...params)));
    }

    subscribe = packagers => packagers.forEach(({js, css, hash, dependencies}) => {
        const listeners = this.#listeners;
        js?.on('change', listeners.get('js.change'));
        css?.on('change', listeners.get('css.change'));
        hash.on('change', listeners.get('hash.change'));
        dependencies.on('change', listeners.get('dependencies.change'));
        dependencies.hash.on('change', listeners.get('dependencies.hash.change'));
        dependencies.on('dependency.change', listeners.get('dependency.change'));
    });

    unsubscribe = packagers => packagers.forEach(({js, css, hash, dependencies}) => {
        const listeners = this.#listeners;
        js?.off('change', listeners.get('js.change'));
        css?.off('change', listeners.get('css.change'));
        hash.off('change', listeners.get('hash.change'));
        dependencies.off('change', listeners.get('dependencies.change'));
        dependencies.hash.off('change', listeners.get('dependencies.hash.change'));
        dependencies.off('dependency.change', listeners.get('dependency.change'));
    });
}
