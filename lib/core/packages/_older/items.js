module.exports = class {
    #applications;

    constructor(applications) {
        this.#applications = applications;
    }

    get processed() {
        if (!this.#applications.processed) return false;
        let processed = true;
        this.#applications.forEach(application => processed = processed && application.processed);
        return processed;
    }

    /**
     * Find a application by its name
     * @param name {string} The application name
     */
    find(name) {
        return [...this.values()].find(application => application.name === name);
    }
}
