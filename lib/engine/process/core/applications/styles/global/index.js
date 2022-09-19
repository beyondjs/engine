module.exports = class {
    #application;
    #distributions = new Map();

    constructor(application) {
        this.#application = application;
    }

    get(distribution) {
        if (!distribution || !distribution.key) throw new Error('Invalid parameters');

        const {key} = distribution;
        if (this.#distributions.has(key)) return this.#distributions.get(key);

        const Styles = require('./styles');
        const styles = new Styles(this.#application.template.global, distribution);
        this.#distributions.set(key, styles);
        return styles;
    }

    destroy() {
        this.#distributions.forEach(styles => styles.destroy());
    }
}
