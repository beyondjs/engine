module.exports = class extends Map {
    #property;
    #destroyed = false;
    get destroyed() {
        return this.#destroyed;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.errors.length;
    }

    #initialise = branchesSpecs => branchesSpecs.forEach((type, branch) => {
        if (!branch.startsWith(`${this.#property.branch}/`)) return;
        const split = branch.substr(this.#property.branch.length + 1).split('/');
        if (split.length !== 1) return;
        const child = split[0];

        // Variable type can be 'object' or 'array'
        const property = new (require(`../${type}`))(undefined, undefined, branch, this.#property);
        this.set(child, property);
    });

    constructor(property) {
        super();
        this.#property = property;
        this.#initialise(this.#property.branchesSpecs);
    }

    update() {
        if (this.#destroyed) throw new Error('Properties are destroyed');
        let {value} = this.#property;

        const values = typeof value === 'object' ? new Map(Object.entries(value)) : new Map();
        for (const [branch, property] of this) {
            const child = branch.split('/').pop();
            property.data = values.has(child) ? values.get(child) : void 0;
        }
    }

    destroy() {
        if (this.#destroyed) throw new Error('Properties already destroyed');
        this.#destroyed = true;

        this.forEach(property => property.destroy());
        super.clear();
    }
}
