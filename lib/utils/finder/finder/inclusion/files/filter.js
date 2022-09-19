const {relative} = require('path');

module.exports = class {
    #root;
    #excludes;
    #filename;
    #extname;
    #filter;

    constructor(root, specs) {
        this.#root = root;
        this.#excludes = specs.excludes;
        this.#filename = specs.filename;
        this.#extname = specs.extname;
        this.#filter = specs.filter;
    }

    /**
     * Check if the file passes the filters conditions
     *
     * @param file {object} The file to be checked
     * @returns {{warning: string, passed: boolean}}
     */
    check(file) {
        const output = {};

        // If a filename was specified to filter the finder, verify that the file meets this condition
        if (this.#filename && this.#filename !== file.filename) {
            output.warning = 'File does not comply the filename criteria';
            output.passed = false;
            return output;
        }

        // If a extension was specified to filter the finder, verify that the file meets this condition
        if (this.#extname && !this.#extname.includes(file.extname)) {
            output.warning = 'Invalid extension';
            output.passed = false;
            return output;
        }

        // If a filter function was specified, call it to check this file the passes it
        if (typeof filter === 'function' && !filter(file)) {
            output.warning = 'Excluded by the filter function';
            output.passed = false;
            return output;
        }

        // Check if file is excluded from the search
        const excluded = (file) => this.#excludes.reduce((prev, exclude) =>
            prev || !relative(exclude, file.relative.file).startsWith('..'),
            false
        );

        if (excluded(file)) {
            output.warning = 'File is excluded by the list of exclusions';
            output.passed = false;
            return output;
        }

        output.passed = true;
        return output;
    }
}
