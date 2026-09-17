module.exports = class {
    //TODO The parent class constructor is not using the skeleton properties of the child classes
    constructor(config) {
        this.skeleton && this.skeleton.forEach(property => {
            if (!config.hasOwnProperty(property)) return;
            this[`_${property}`] = config[property];
        });
    }

    getContent() {
        const json = {};

        this.skeleton.forEach(property => {
            if (this[`_${property}`] && this.hasOwnProperty(`_${property}`)) {
                json[property] = this[`_${property}`];
            }
        });

        return json;
    }

    setValues(specs) {
        // console.log('VALIDATOR ', specs) This method is being entered twice to add the scss files
        for (const property in specs) {
            if (!specs.hasOwnProperty(property)) continue;
            if (!this.skeleton.includes(property) && !this.hasOwnProperty(`_${property}`)) continue;

            if (property !== 'files') {
                this[`_${property}`] = specs[property];
                continue;
            }

            if (this[`_${property}`].includes('*')) {
                //The array contains * and therefore includes every file in the path
                continue;
            }

            if (typeof specs[property] !== 'object') {
                this[`_${property}`].push(specs[property]);
                continue;
            }

            const file = specs[property]?.item;
            const add = !(specs[property].hasOwnProperty('action') && specs[property].action === 'remove');
            if (add) {
                !this[`_${property}`].includes(file) ? this[`_${property}`].push(file) : null;
                continue;
            }

            //validate if the item exists and delete it
            const i = this[`_${property}`].indexOf(file);
            i !== -1 && this[`_${property}`].splice(i, 1);
        }
    }
}