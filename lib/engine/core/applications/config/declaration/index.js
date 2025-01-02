const fs = require('fs');
module.exports = fs.readFileSync(require('path').join(__dirname, './config.txt'), 'utf8');
