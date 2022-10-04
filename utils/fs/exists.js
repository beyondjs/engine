const fs = require('fs').promises;

module.exports = file => new Promise(resolve => {
    fs.access(file).then(() => resolve(true)).catch(() => resolve(false));
});
