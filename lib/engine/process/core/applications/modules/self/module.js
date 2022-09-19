// Application Module
const AM = require('../../module');

module.exports = class extends AM {
    constructor(finder, file) {
        const module = new (require('../../../module'))(finder.application, file);
        super(finder.application, module);
    }
}
