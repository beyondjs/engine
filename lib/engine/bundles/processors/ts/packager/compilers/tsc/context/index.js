const fs = require('fs');
module.exports = fs.readFileSync(require('path').join(__dirname, './context.txt'), 'utf8');
