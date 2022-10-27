module.exports = class {
    #application;
    #compilations = new Map();

    constructor(application) {
        this.#application = application;
    }

    get(cspecs) {
        if (!cspecs || typeof cspecs.key !== 'function') throw new Error('Invalid parameters');

        const key = cspecs(key);
        if (this.#compilations.has(key)) return this.#compilations.get(key);

        const Styles = require('./styles');
        const styles = new Styles(this.#application.template.application, cspecs);
        this.#compilations.set(key, styles);
        return styles;
    }

    destroy() {
        this.#compilations.forEach(styles => styles.destroy());
    }
}
