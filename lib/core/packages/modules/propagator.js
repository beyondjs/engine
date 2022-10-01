module.exports = class {
    #listeners = new Map();

    constructor(emitter) {
        const listeners = this.#listeners;

        listeners.set('module.change', module => {
            emitter.emit('module.change');
            emitter.emit(`module.${module.pathname}.change`);
        });
        listeners.set('bundles.change', bundles => {
            emitter.emit('bundles.change');
            emitter.emit(`bundles.${bundles.container.pathname}.change`);
        });
        listeners.set('bundle.change', bundle => {
            emitter.emit('bundle.change');
            emitter.emit(`bundle.${bundle.type}.change`);
            emitter.emit(`bundle.${bundle.pathname}.change`);
        });
        listeners.set('packager.change', ({bundle, distribution, language}) => {
            emitter.emit(`packager.${distribution.key}.${language}.change`);
            emitter.emit(`packager.${bundle.type}.${distribution.key}.${language}.change`);
        });
        listeners.set('dependencies.change', ({bp}) => {
            const {distribution, language} = bp;
            emitter.emit(`dependencies.${distribution.key}.${language}.change`);
        });
        listeners.set('dependency.change', ({distribution, language}) => {
            emitter.emit(`dependency.${distribution.key}.${language}.change`);
        });
        listeners.set('js.change', ({packager}) => {
            const {bundle, distribution, language} = packager;
            emitter.emit(`js.${bundle.type}.${distribution.key}.${language}.change`);
            emitter.emit(`js.${bundle.pathname}.${distribution.key}.${language}.change`);
        });
        listeners.set('css.change', ({packager}) => {
            const {bundle, distribution, language} = packager;
            emitter.emit(`css.${bundle.type}.${distribution.key}.${language}.change`);
            emitter.emit(`css.${bundle.pathname}.${distribution.key}.${language}.change`);
        });
        listeners.set('hash.change', ({packager}) => {
            const {bundle, distribution, language} = packager;
            emitter.emit(`hash.${bundle.type}.${distribution.key}.${language}.change`);
        });
    }

    subscribe = modules => modules.forEach(module => {
        const listeners = this.#listeners;

        module.on('change', listeners.get('module.change'));
        module.bundles.on('change', listeners.get('bundles.change'));
        module.bundles.on('bundle.change', listeners.get('bundle.change'));
        module.bundles.on('packager.change', listeners.get('packager.change'));
        module.bundles.on('dependencies.change', listeners.get('dependencies.change'));
        module.bundles.on('dependency.change', listeners.get('dependency.change'));
        module.bundles.on('js.change', listeners.get('js.change'));
        module.bundles.on('css.change', listeners.get('css.change'));
        module.bundles.on('hash.change', listeners.get('hash.change'));
    });

    unsubscribe = modules => modules.forEach(module => {
        const listeners = this.#listeners;

        module.off('change', listeners.get('module.change'));
        module.bundles.off('change', listeners.get('bundles.change'));
        module.bundles.off('bundle.change', listeners.get('bundle.change'));
        module.bundles.off('packager.change', listeners.get('packager.change'));
        module.bundles.off('dependencies.change', listeners.get('dependencies.change'));
        module.bundles.off('dependency.change', listeners.get('dependency.change'));
        module.bundles.off('js.change', listeners.get('js.change'));
        module.bundles.off('css.change', listeners.get('css.change'));
        module.bundles.on('hash.change', listeners.get('hash.change'));
    });
}
