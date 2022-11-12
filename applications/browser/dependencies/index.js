const respond = require('../respond');
const {Tree: DependenciesTree, Config: DependenciesConfig} = require('beyond/dependencies');
const source = (require('./source'));

module.exports = function (specs, response) {
    const done = ({script, error}) => {
        const statusCode = error ? 500 : 200;
        const content = error ? error : script;
        const contentType = error ? 'text/plain' : 'application/json';

        respond({content, statusCode, contentType}, response);
    }

    const config = new DependenciesConfig({dependencies: specs.dependencies});
    const tree = new DependenciesTree(config);
    tree.ready.then(() => {
        if (!tree.filled) {
            done({error: `Dependencies are outdated`});
            return;
        }

        const dependencies = (() => {
            const dependencies = new Map();
            tree.list.forEach(({specifier, version}) => dependencies.set(specifier, version));
            return JSON.stringify([...dependencies]);
        })();

        const script = source.replace(/\/\*(\s*)dependencies(\s*)\*\//, dependencies);
        done({script});
    });
}
