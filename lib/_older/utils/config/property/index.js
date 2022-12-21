const DynamicProcessor = require('../../dynamic-processor')();
const equal = require('../../equal');

// The autoincrement is just to have an id in the config objects that is useful in development to trace the code
let autoincrement = 0;

/**
 * Configuration property, abstract class from which classes './array' and './object' inherit
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'utils.config.property';
    }

    #parent;
    get parent() {
        return this.#parent;
    }

    #branchesSpecs;
    get branchesSpecs() {
        return this.#branchesSpecs;
    }

    #id = autoincrement++;
    get id() {
        return this.#id;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.errors.length;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    // Only defined when it is not a branch property
    #rootPath;
    get rootPath() {
        return this.#rootPath;
    }

    #path;
    get path() {
        return this.#path;
    }

    // Can be 'array' or 'object'
    #type;
    get type() {
        return this.#type;
    }

    // The original configured data
    // (can be the string that points to the configuration file, an object, or an array of configurations)
    #data;
    get data() {
        return this.#data;
    }

    set data(value) {
        if (typeof value !== 'string' && !this.#parent) {
            // It is the root property, it is required the name of the file to be processed
            throw new Error('Data must be the file to be processed when refers to a root configuration object');
        }

        this.#path = (() => {
            if (!['object', 'string'].includes(typeof value)) return;

            const {join, dirname} = require('path');
            const root = this.#parent ? this.#parent.path : this.#rootPath;

            if (typeof value === 'object') {
                const path = value.path ? join(root, value.path) : root;
                delete value.path;
                return path;
            }
            else if (typeof value === 'string') {
                return dirname(join(root, value));
            }
        })();

        // Once the path is set, and removed from the value, then we can compare with the previous value
        // to check if the configuration has changed
        if (equal(value, this.#data)) return;

        this.#data = value;
        this._invalidate();
    }

    #value;
    get value() {
        return this.#value;
    }

    #branch;
    get branch() {
        return this.#branch;
    }

    /**
     * Configuration property constructor
     *
     * @param rootPath {string=} The path where the configuration file is located.
     * (only if the property is the root, otherwise it must be undefined).
     * Once the initial path is configured in the root property, the child nodes that have their
     * configuration in files, calculates its path with respect to its location.
     * @param branchesSpecs {object=} The list of properties that can be stored in independents files.
     * The key is the branch, and the value can be 'array' or 'object'
     * (only if the property is the root, otherwise it should be undefined)
     * @param branch {string=} The branch of the current property.
     * Ex: '/applications/children/template'
     * (if the property is the root, then an empty string ('') can be specified, or undefined)
     * @param parent {object=} The parent property.
     * (only if the property is a branch, otherwise it should be undefined)
     */
    constructor(rootPath, branchesSpecs, branch, parent) {
        branch = branch ? branch : '';
        if (typeof branch !== 'string') throw new Error('Invalid "branch" parameter');
        if ((rootPath && parent) || (!rootPath && !parent)) throw new Error('Invalid parameters');
        super();

        this.#rootPath = rootPath;
        this.#branchesSpecs = parent ? parent.branchesSpecs : new (require('./branches-specs'))(branchesSpecs);

        this.#branch = branch;
        this.#parent = parent;

        if (!this.#branchesSpecs.has(branch)) throw new Error(`Branch "${branch}" not found`);
        this.#type = this.#branchesSpecs.get(branch);
    }

    async _begin() {
        await this.#parent?.ready;
    }

    _prepared() {
        // Unregister file child if it has changed
        (() => {
            if (!this.children.has('file')) return;

            const file = this.children.get('file').child;
            const root = this.#parent ? this.#parent.path : this.#rootPath;
            if (file.root === root || file.relative === this.#data) return;

            file.destroy();
            this.children.unregister(['file']);
        })();

        // Register file child if it is not previously registered
        (() => {
            if (this.children.has('file') || typeof this.#data !== 'string') return;

            const root = this.#parent ? this.#parent.path : this.#rootPath;
            const file = new (require('./file'))(root, this.#data);
            this.children.register(new Map([['file', {child: file}]]));
        })();
    }

    _process() {
        const previous = {value: this.#value, errors: this.#errors};

        this.#errors = [];

        if (['object', 'undefined'].includes(typeof this.#data)) {
            this.#value = this.#data;
        }
        else if (typeof this.#data === 'string') {
            const file = this.children.get('file').child;
            this.#errors = file.errors;
            this.#value = file.value;
        }
        else {
            this.#errors.push(`Configuration value is invalid, value type must be an object, ` +
                `a string or undefined, but it is "${typeof this.#data}"`);
            this.#value = void 0;
        }

        return !equal(previous, {value: this.#value, errors: this.#errors});
    }
}
