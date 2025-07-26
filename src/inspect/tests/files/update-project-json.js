const execute = async () => {

    const {Project} = require('./imports');
    const {skeleton, dist} = require('./validator-test');
    // const validator = new Validator();

    const project = new Project('./');
    const r = await project.load();

    // const response = project.deployment.setDistribution({
    //     "name": "node",
    //     "platform": "node",
    //     "environment": "development",
    //     ports: {
    //         http: 3500
    //     }
    // });
    console.log(7, [...project.deployment.distributions.keys()], r)

    const a = {
        "checked": false,
        "checkType": false,
        "name": "9500",
        "bundles": {
            "mode": "sjs"
        },
        "ssr": "",
        "isDefault": false,
        "platform": "android",
        "environment": "development",
        "showAdvancedFields": false,
        "mode": "sjs",
        "ports": {
            "bundles": 7500,
            "http": 3000
        },
        "minify": {
            "html": false,
            "css": false,
            "js": false
        }
    }
    const response = await project.deployment.setDistribution(a, true);
    console.log(500, response)
    project.save({name: 'testing', title: 'Titulo cualquiera'});
}
execute();
