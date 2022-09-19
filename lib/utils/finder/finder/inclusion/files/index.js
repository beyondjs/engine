/**
 * Adds a filter specification to the array of files
 */
module.exports = class extends require('../../../files') {
    // An object with a .check(file) method that verifies if a file
    // complies with the specified filters
    #filter;
    get filter() {
        return this.#filter;
    }

    constructor(root, specs) {
        if (typeof root === 'number') {
            // Occurs when the inclusion is created internally by javascript.
            // Example: When splice is executed, it returns an array of the elements being deleted.
            return super(root);
        }

        super(root);
        this.#filter = new (require('./filter'))(root, specs);
    }

    /**
     * Push a file to the array
     * @param file {object} The file object
     * @param sort {boolean}
     */
    push(file, sort = true) {
        file = this._getFileObject(file);
        const check = this.#filter.check(file);
        if (!check.passed) return;

        return super.push(file, sort);
    }
}
