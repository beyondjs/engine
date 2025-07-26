(async () => {
    const wd = require('path').join(process.cwd(), 'apps');
    const {Project} = require('./imports');
    const name = `app-test-${Math.floor(Math.random() * 100)}`;
    const project = new Project(require('path').join(wd, name));
    console.log(`creating app: ${name}`.bgYellow)

    const params = {
        "navigatePort": 8080,
        "inspectPort": 4070,
        "type": "node",
        "name": "caracas",
        "scope": "carcas",
        "title": "caracas",
        "version": 1,
        "platforms": [
            {
                "name": "backend",
                "inspectPort": 4070,
                "port": 8080
            }
        ],
        "processing": true,
        "description": "caracas"
    };
    try {
        const type = 'node';
        await project.create(type, {
            platforms: [
                {

                    "platform": "web",
                    "inspectPort": 4070,
                    "port": 8080
                },
                {
                    "platform": "backend",
                    "inspectPort": 4070,
                    "port": 8080
                }

            ],
            scope: '@baleares',
            name,
            title: 'example app 2',
            description: 'example app description',
        });
    }
    catch (e) {
        console.log(`${e.message}`.bgRed);
        console.trace(e)
    }

    console.log("ready", name)
})();
