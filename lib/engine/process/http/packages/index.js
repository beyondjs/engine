const express = require('express');
const {Route, router} = require('@beyond-js/uimport/router');
const internals = require('./internals');

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

        app.all('*', async (req, res) => {
            const route = new Route(req);
            if (route.error) {
                res.status(404).send(`Error: (404) - ${route.error}`).end();
                return;
            }

            if (await internals(this.#core, route, res)) return;

            router(route, res).catch(exc => {
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

