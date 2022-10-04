const fs = require('fs').promises;

module.exports = {
    ...fs,
    exists: require('./exists'),
    save: require('./save'),
    copy: require('./copy')
}
