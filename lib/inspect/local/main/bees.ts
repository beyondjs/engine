import {BEE} from "./bee";

export /*bundle*/
const bees = new class {
    #bees: Map<string, BEE> = new Map();

    get(id: string): BEE {
        if (this.#bees.has(id)) return this.#bees.get(id);
        const bee = new BEE(id);
        this.#bees.set(id, bee);
        return bee;
    }
}
