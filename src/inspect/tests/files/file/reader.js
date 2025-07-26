const {join} = require('path');
(async () => {
    const wd = require('path').join(process.cwd(), 'app');
    const {File} = require('../imports');
    const filename = join(wd, '' );
    const file = new File(filename, join('module-to-read', 'module.json'));

    // await file.load();
    const {constants, promises: {stat}} = require('fs');

    console.log(1, wd);
    console.log(2.1, file.json);
    console.log(2.1, file.dirname);
    console.log(2.2, file.basename);
    console.log(2.3, file.relative);
    console.log(2.4, file.extname);
    const response = await file.readJSON();
    console.log(2.5, response)
    setTimeout(() => console.log('terminó.'), 10000000)
})();
