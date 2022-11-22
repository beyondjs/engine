/**
 * Diagnostics are used by the analyzer and the compiler
 */
module.exports = class extends Array {
    get valid() {
        const invalid = this.reduce((diagnostic, invalid) => invalid || !!diagnostic.error, false);
        return !invalid;
    }

    push(diagnostic) {
        super.push(diagnostic);
    }

    // Set and hydrate as two different methods just because the interface could change in the future
    hydrate(cached) {
        this.set(cached);
    }

    set(data) {
        data?.forEach(diagnostic => this.push(diagnostic));
    }

    toJSON() {
        return [...this];
    }
}
