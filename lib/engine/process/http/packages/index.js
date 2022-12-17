const express = require('express');
const router = require('@beyond-js/uimport/router');

module.exports = class {
    #core;
    #local;
    #app;

    constructor(core, local) {
        this.#core = core;
        this.#local = local;
    }

    initialise(port) {
        const PORT = port || this.#local.repository;

        const app = this.#app = express();
        app.use(express.json());

        app.all('*', (req, res) => {
            router(req, res).catch(exc => {
                console.log(exc.stack);
                res.status(500).send(`Error: (500) - Error caught processing request: ${exc.message}`);
            });
        });

        app.listen(PORT, () => {
            console.log('Local repository port is:', PORT);
            console.log(`http://localhost:${PORT}`);
        });
    }
}

