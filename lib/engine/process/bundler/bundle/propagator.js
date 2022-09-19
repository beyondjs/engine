module.exports = class {
    #listeners = new Map();

    constructor(emitter) {
        const events = ['packager.change', 'dependencies.change', 'dependency.change',
            'js.change', 'css.change', 'hash.change'];
        events.forEach(event => this.#listeners.set(event, (...params) => emitter.emit(event, ...params)));
    }

    subscribe(packager) {
        const listeners = this.#listeners;
        packager.on('change', listeners.get('packager.change'));
        packager.dependencies.on('change', listeners.get('dependencies.change'));
        packager.dependencies.on('dependency.change', listeners.get('dependency.change'));
        packager.js?.on('change', listeners.get('js.change'));
        packager.css?.on('change', listeners.get('css.change'));
        packager.hash.on('change', listeners.get('hash.change'));
    }

    unsubscribe(packager) {
        const listeners = this.#listeners;
        packager.off('change', listeners.get('packager.change'));
        packager.dependencies.off('change', listeners.get('dependencies.change'));
        packager.dependencies.off('dependency.change', listeners.get('dependency.change'));
        packager.js?.off('change', listeners.get('js.change'));
        packager.css?.off('change', listeners.get('css.change'));
        packager.hash.off('change', listeners.get('hash.change'));
    }
}
