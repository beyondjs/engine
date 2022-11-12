const respond = require('../respond');
const {Tree: DependenciesTree, Config: DependenciesConfig} = require('beyond/dependencies');

module.exports = function (specs, response) {
    const done = ({script, error}) => {
        const statusCode = error ? 500 : 200;
        const content = error ? error : script;
        const contentType = error ? 'text/plain' : 'application/javascript';

        respond({content, statusCode, contentType}, response);
    }

    const config = new DependenciesConfig({dependencies: specs.dependencies});
    const tree = new DependenciesTree(config);
    tree.ready.then(() => {
        if (!tree.filled) {
            done({error: `Dependencies are outdated`});
            return;
        }

        const script = 'The dependencies';
        console.log('Are dependencies tree filled:', tree.filled, tree);
        done({script});
    });
}
