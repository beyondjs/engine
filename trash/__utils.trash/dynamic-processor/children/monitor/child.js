module.exports = class {
    #child;
    get child() {
        return this.#child;
    }

    #reevaluate;
    #onchange = () => this.#reevaluate(this.#child);

    constructor(child, reevaluate) {
        this.#child = child;
        this.#reevaluate = reevaluate;

        child.ready; // By calling the ready property, it will launch the initialisation (if not already)
        child.on('change', this.#onchange);
    }

    destroy() {
        this.#child.off('change', this.#onchange);
    }
}
