require('colors');

module.exports = class {
    #dp;
    #timer;
    #delay;

    constructor(dp, delay) {
        this.#dp = dp;
        this.#delay = delay ? delay : 5000;
    }

    #checkpoint = () => {
        const dp = this.#dp;

        let id = dp.id ? `: ${dp.id}` : '';
        id = `${dp.dp}${id}`;

        const warning = `Dynamic processor "${id}" is taking more than expected.` +
            (dp.initialising ? ' Processor is still initialising.' : '');
        console.log(warning);

        const unprocessed = [...dp.children.waiting].map(([name, {child}]) => {
            const uninitialised = !dp.initialised ? ' [not initialised]' : '';
            return `${name}${uninitialised}: ${child.dp}`;
        });
        const count = ((unprocessed, total) => unprocessed && `(${unprocessed}/${total})`)(unprocessed.length, dp.children.size);

        unprocessed.length ?
            console.log(`\tUnprocessed children ${count}:`, unprocessed) :
            console.log(`\tChildren processors [${[...dp.children.keys()]}] are already processed`);

        // Dynamic processors that are checked at the _prepared method
        const pendings = (() => {
            let count = 0;

            const messages = [...dp._pendings].map(([pending, {id}]) => {
                count += pending.processed ? 0 : 1;

                const state = pending.processed ? 'already processed' : 'not processed';
                let initialisation = pending.initialised ? '' :
                    (pending.initialising ? 'initialising' : 'not initialised');

                id = id ? ` (${id})` : '';
                return `${pending.dp}${id}: ${initialisation ? initialisation : state}`;
            });

            return {count, messages};
        })();

        pendings.messages.length && console.log('\tWaiting for:', pendings.messages);

        if (!unprocessed.length && !pendings.count) {
            console.log('\tError found! This processor does not have any unprocessed children!'.red);
        }
    }

    set() {
        !this.#timer && (this.#timer = setTimeout(this.#checkpoint, this.#delay));
    }

    release() {
        clearTimeout(this.#timer);
        this.#timer = undefined;
    }
}
