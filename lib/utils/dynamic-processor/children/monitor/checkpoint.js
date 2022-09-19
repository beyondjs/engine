require('colors');

module.exports = class {
    #children;
    #timer;
    #delay;
    #logs;

    /**
     * The reason why the _prepared method is blocking the processing of the dp
     * @type Undefined | string
     */
    #onhold;

    constructor(children, delay) {
        this.#children = children;
        this.#delay = delay ? delay : 5000;
        this.#logs = require('../../logs');
    }

    #checkpoint = () => {
        const children = this.#children;
        const {dp} = children;
        const logs = this.#logs;

        let id = dp.id ? `: ${dp.id}` : '';
        id = `${dp.dp.bold}${id}`;

        const warning = `Dynamic processor "${id}" is taking more than expected.`.red +
            (dp.initialising ? ' Processor is still initialising.' : '');
        logs.append(warning);

        this.#onhold && logs.append('\tBlocked by the following reason:', this.#onhold.bold);

        const {pending} = children;
        pending.length && logs.append('\tWaiting for:'.bold);
        pending.forEach(child => {
            const processed = (() => {
                if (!child.initialised) return 'not initialised';
                return child.processed ? 'already processed' : 'not processed';
            })();
            logs.append(`\t\t* ${child.dp}: ${processed}`);
        });
        logs.append('');
    }

    hang(reason) {
        this.#onhold = reason ? reason : 'not specified';
        this.#timer && clearTimeout(this.#timer);
        this.#timer = setTimeout(this.#checkpoint, this.#delay);
    }

    set() {
        this.#timer && clearTimeout(this.#timer);
        this.#timer = setTimeout(this.#checkpoint, this.#delay);
    }

    release() {
        clearTimeout(this.#timer);
        this.#timer = this.#onhold = void 0;
    }
}
