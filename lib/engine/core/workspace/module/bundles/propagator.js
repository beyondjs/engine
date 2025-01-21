module.exports = class {
    #listeners = new Map();

    constructor(emitter) {
        const events = ['bundle.change', 'packager.change',
            'dependencies.change', 'dependency.change', 'js.change', 'css.change', 'hash.change'];
        events.forEach(event => this.#listeners.set(event, (...params) => emitter.emit(event, ...params)));
    }

    subscribe = bundles => bundles.forEach(bundle => {
        const listeners = this.#listeners;
        bundle.on('change', listeners.get('bundle.change'));
        bundle.packagers.on('packager.change', listeners.get('packager.change'));
        bundle.packagers.on('dependencies.change', listeners.get('dependencies.change'));
        bundle.packagers.on('dependency.change', listeners.get('dependency.change'));
        bundle.packagers.on('js.change', listeners.get('js.change'));
        bundle.packagers.on('css.change', listeners.get('css.change'));
        bundle.packagers.on('hash.change', listeners.get('hash.change'));
    });

    unsubscribe = bundles => bundles.forEach(bundle => {
        const listeners = this.#listeners;
        bundle.off('change', listeners.get('bundle.change'));
        bundle.packagers.off('packager.change', listeners.get('packager.change'));
        bundle.packagers.off('dependencies.change', listeners.get('dependencies.change'));
        bundle.packagers.off('dependency.change', listeners.get('dependency.change'));
        bundle.packagers.off('js.change', listeners.get('js.change'));
        bundle.packagers.off('css.change', listeners.get('css.change'));
        bundle.packagers.off('hash.change', listeners.get('hash.change'));
    });
}
