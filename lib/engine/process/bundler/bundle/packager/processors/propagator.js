module.exports = class {
    #listeners = new Map();

    constructor(emitter) {
        const events = ['hashes.change', 'js.change', 'css.change',
            'dependencies.change', 'dependency.change', 'declaration.change'];
        events.forEach(event => this.#listeners.set(event, () => emitter.emit(event)));
    }

    subscribe = processors => processors.forEach(processor => {
        const listeners = this.#listeners;
        const {hashes, packager, dependencies} = processor;

        hashes.on('change', listeners.get('hashes.change'));

        if (packager) {
            const {js, css, declaration} = packager;
            js?.on('change', listeners.get('js.change'));
            css?.on('change', listeners.get('css.change'));
            declaration?.on('change', listeners.get('declaration.change'));
        }

        if (dependencies) {
            dependencies.on('change', listeners.get('dependencies.change'));
            dependencies.on('dependency.change', listeners.get('dependency.change'));
        }
    });

    unsubscribe = processors => processors.forEach(processor => {
        const listeners = this.#listeners;
        const {hashes, packager, dependencies} = processor;

        hashes.off('change', listeners.get('hashes.change'));

        if (packager) {
            const {js, css, declaration} = packager;
            js?.off('change', listeners.get('js.change'));
            css?.off('change', listeners.get('css.change'));
            declaration?.off('change', listeners.get('declaration.change'));
        }

        if (dependencies) {
            dependencies.off('change', listeners.get('dependencies.change'));
            dependencies.off('dependency.change', listeners.get('dependency.change'));
        }
    });
}
