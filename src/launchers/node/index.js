const BEE = require('@beyond-js/bee');

(() => {
    let specs;
    try {
        let __bee = {specs: void 0, bridges: void 0};
        __bee.specs = specs = JSON.parse(process.argv[2]);

        // __bee.specs is required by @beyond-js/backend and @beyond-js/ssr to access the server ports
        // __bee.bridges is required by @beyond-js/backend
        Object.defineProperty(global, '__bee', {get: () => __bee});
    }
    catch (exc) {
        console.error('Error parsing BEE specification', exc.stack);
        return;
    }

    const {project, distribution, ports, local} = specs;
    process.title = `"${project.pkg}" project`;

    const port = ports.bundles;
    BEE(`http://localhost:${port}`, local);

    bimport('/start').then(() => {
        // In ssr and backend platforms, the 'initialised' event is emitted
        // by @beyond-js/ssr and @beyond-js/backend packages after their servers are initialised.
        // It is required by @beyond-js/local/main to know when the server is ready to accept requests
        !['ssr', 'backend'].includes(distribution.platform) && process.send({type: 'ready'});
    });
})();
