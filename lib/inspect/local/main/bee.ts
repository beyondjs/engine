import {module} from 'beyond_context';
import {Events} from '@beyond-js/kernel/core';

export class BEE extends Events {
    readonly #id: string;

    constructor(id: string) {
        super();
        this.#id = id;
    }

    #status = async (): Promise<string> => {
        return <string>await module.execute('bees/status', {id: this.#id});
    }

    get status() {
        return this.#status();
    }

    async start() {
        await module.execute('bees/start', {id: this.#id});
    }

    async stop() {
        await module.execute('bees/stop', {id: this.#id});
    }
}
