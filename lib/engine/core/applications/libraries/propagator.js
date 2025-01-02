module.exports = class {
    #listeners = new Map();

    constructor(emitter) {
        const events = ['library.change', 'bundles.change', 'modules.change'];
        events.forEach(event => this.#listeners.set(event, (...params) => emitter.emit(event, ...params)));

        this.#listeners.set('bundle.change', bundle => {
            emitter.emit(`bundle.change`, bundle);
            emitter.emit(`bundle.${bundle.type}.change`);
        });
        this.#listeners.set('packager.change', ({bundle, distribution, language}) => {
            emitter.emit(`packager.${bundle.type}.${distribution.key}.${language}.change`);
        });
        this.#listeners.set('js.change', ({packager}) => {
            const {bundle, distribution, language} = packager;
            emitter.emit(`js.${bundle.type}.${distribution.key}.${language}.change`);
        });
        this.#listeners.set('css.change', ({packager}) => {
            const {bundle, distribution, language} = packager;
            emitter.emit(`css.${bundle.type}.${distribution.key}.${language}.change`);
        });
        this.#listeners.set('hash.change', ({packager}) => {
            const {bundle, distribution, language} = packager;
            emitter.emit(`hash.${bundle.type}.${distribution.key}.${language}.change`);
        });
    }

    subscribe = libraries => libraries.forEach(library => {
        const listeners = this.#listeners;
        library.on('change', listeners.get('library.change'));
        library.modules.on('change', listeners.get('modules.change'));
        library.bundles.on('change', listeners.get('bundles.change'));
        library.bundles.on('bundle.change', listeners.get('bundle.change'));
        library.bundles.on('packager.change', listeners.get('packager.change'));
        library.bundles.on('js.change', listeners.get('js.change'));
        library.bundles.on('css.change', listeners.get('css.change'));
        library.bundles.on('hash.change', listeners.get('hash.change'));
    });

    unsubscribe = libraries => libraries.forEach(library => {
        const listeners = this.#listeners;
        library.off('change', listeners.get('library.change'));
        library.modules.off('change', listeners.get('modules.change'));
        library.bundles.off('change', listeners.get('bundles.change'));
        library.bundles.off('bundle.change', listeners.get('bundle.change'));
        library.bundles.off('packager.change', listeners.get('packager.change'));
        library.bundles.off('js.change', listeners.get('js.change'));
        library.bundles.off('css.change', listeners.get('css.change'));
        library.bundles.off('hash.change', listeners.get('hash.change'));
    });
}
