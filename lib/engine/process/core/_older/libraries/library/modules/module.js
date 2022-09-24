module.exports = class extends require('../../../module') {
    constructor(finder, file) {
        super(finder.library, file);
    }
}
