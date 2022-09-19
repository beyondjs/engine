module.exports = class extends Map {
    #Item;
    #ids;
    #parentIdentifier;

    #ready = Promise.pending();
    get ready() {
        return this.#ready.value;
    }

    #initialise = async () => {
        const promises = [];

        // Remove duplicated ids
        let ids = this.#ids;
        ids = ids.filter((e, i) => ids.indexOf(e) === i);

        for (let id of ids) {
            if (!(ids instanceof Array)) id = this.#parentIdentifier ? `${this.#parentIdentifier}${id}` : id;
            const item = new this.#Item(id);
            this.set(id, item);
            promises.push(item.ready);
        }
        await Promise.all(promises);
        this.#ready.resolve();
    };

    constructor(Item, ids, parentIdentifier) {
        super();
        this.#Item = Item;
        this.#ids = ids;
        this.#parentIdentifier = parentIdentifier;

        this.#initialise().catch(exc => console.error(2, exc.stack));
    }
}
