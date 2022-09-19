import {instances as bundles} from '@beyond-js/kernel/bundle';
import {backends} from '@beyond-js/backend/client';
import {Socket} from "socket.io-client";

interface BImport {
    (resource: string, version?: number): Promise<any>,

    mode: string
}

declare const bimport: BImport;
declare const breload: (resource: string, version?: number) => void;

interface HMRMessage {
    bundle: string,
    distribution: number,
    language: string,
    extname: string
}

new class {
    #changes: Map<string, number> = new Map();

    async #js(bundle: string, language: string) {
        if (!bundles.has(bundle)) return;
        const pkg = bundles.get(bundle).package(language !== '.' ? language : '');

        const change = (() => {
            !this.#changes.has(bundle) && this.#changes.set(bundle, 0);
            const change = this.#changes.get(bundle);
            this.#changes.set(bundle, change + 1);
            return change;
        })();

        // Note: in AMD mode, the querystring is not allowed (it is used require.undef by the beyond.reload method)
        const url = bimport.mode === 'amd' ? `${pkg.id}.hmr` : `${pkg.id}?hmr=${change}`;

        try {
            await breload(url, change);
        } catch (exc) {
            console.log(`Error loading hmr of bundle "${pkg.bundle.id}"`, exc.stack);
        }
    }

    async #css(bundle: string) {
        if (typeof location !== 'object') return;

        const {styles} = await bimport('@beyond-js/kernel/styles');
        if (!styles.has(bundle)) return;
        (styles.get(bundle)).change();
    }

    async #onchange({bundle, language, extname}: HMRMessage) {
        if (extname === '.js') return await this.#js(bundle, language);
        if (extname === '.css') return await this.#css(bundle);
    }

    #subscribe = async () => {
        const backend = await backends.get('@beyond-js/local');
        const socket: Socket = await backend.socket;
        socket.on('bundle/change', message =>
            this.#onchange(message).catch(exc => console.log(exc.stack)));
    }

    constructor() {
        this.#subscribe().catch(exc => console.error(exc.stack));
    }
}
