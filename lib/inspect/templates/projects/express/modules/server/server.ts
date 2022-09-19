import * as express from 'express';
import {Connections} from "./connections";
import {routes, hmr} from '$[scope]$[name]/routes';

export class Server {
    #instance;
    #connections;
    #app;
    #port = 5000;
    #router;

    constructor() {
        this.#start();
    }

    #start() {
        try {
            this.#app = express();
            this.#app.use(express.json());
            this.#setHeader();
            this.#router = express.Router();
            routes(this.#app);
            //subscription to listen routes module changes.
            hmr.on('change', this.onChange);
            this.#instance = this.#app.listen(this.#port);
            this.#connections = new Connections(this.#instance);
        } catch (exc) {
            console.error('Error', exc);
        }
    }

    #setHeader() {
        this.#app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
            res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
            res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
            next();
        });
    }

    onChange = () => {
        this.#connections.destroy();
        this.#instance.close(() => {
            hmr.off('change', this.onChange);
            this.#start();
        });
    }
}