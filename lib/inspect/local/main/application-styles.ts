import {backends} from '@beyond-js/backend/client';
import {Events} from '@beyond-js/kernel/core';
import type {Socket} from "socket.io-client";

typeof process !== 'object' &&
new class ApplicationStyles extends Events {
    /**
     * The application styles has changed, therefore it must be updated
     */
    #update = (is: string) => {
        const resource = is === 'application' ? 'styles' : 'global';
        document
            .getElementById(`beyond-${is}-styles`)
            .setAttribute('href', `/${resource}.css?updated=${Date.now()}`);

        if (is === 'global') {
            const {instances} = require('@beyond-js/kernel/bundle');
            if (instances.has('@beyond-js/widgets/render')) {
                const {globalcss} = instances.get('@beyond-js/widgets/render').package().exports.values;
                globalcss.update();
            }
        }

        this.trigger(`${is}:change`);
    }

    #subscribe = async () => {
        const backend = await backends.get('@beyond-js/local');
        const socket: Socket = await backend.socket;
        socket.on('application-styles', () => this.#update('application'));
        socket.on('global-styles', () => this.#update('global'));
    }

    constructor() {
        super();
        if (typeof process !== 'undefined') return;
        this.#subscribe().catch(exc => console.error(exc.stack));
    }
}
