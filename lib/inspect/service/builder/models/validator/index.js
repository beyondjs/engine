module.exports.Validator = class {

    constructor(config = {}) {
    }

    checkString(property, data) {
        const {name, values, pipe} = property;
        if (typeof data[name] === "undefined") {
            return true;
        }

        if (values && !values.includes(data[name])) {
            throw new Error(`the value of ${name} is not valid, got: ${data[name]}`);
        }
        if (pipe) pipe({data})
        return true;
    }

    checkObject(property, data) {

        const {name, type, required, pipe} = property;
        let value = data[name];

        if (Array.isArray(type)) {
            if (!Array.isArray(data[name])) {
                throw new Error(`${name} property must be an array of elements`)
            }
            const isInvalid = data[name].find(item => !type.includes(typeof item));

            if (isInvalid) {
                throw new Error(`${name} property must have the following data type : ${type.join(',')}`)
            }

            return true;

        }
        if (type === 'number') value = parseFloat(value);
        if (type === 'number' && typeof value === type) {
            if (pipe) return pipe({property, data})
            return true;
        }
        if (required === true && !data.hasOwnProperty(name)) {
            throw new Error(`${name} value is required`);
        }
        if (type === 'string') return this.checkString(property, data);

        if (typeof value === "undefined") {
            return true;
        }
        const dataType = typeof value;
        if (dataType !== type && !['eoc', 'object'].includes(dataType)) {
            throw new Error(`the ${name} property must be of the following data type: ${type}, obtained: ${value}`);
        }

        if (['eoc', 'object'].includes(typeof property)) {
            const {properties} = property;

            if (!properties) {
                if (pipe) return pipe({property, data})
                return true;
            }
            properties.forEach(prop => this.checkObject(prop, value));
        }
        if (pipe) return pipe({property, data})
        return true;
    }

    isString = (value) => typeof value === 'string';

    check(property, data) {

        if (!data || typeof data !== 'object') {
            throw new Error('the data value must be an object');
        }

        if (this.isString(property) && this.isString(data[property])) {
            return true;
        }

        if (['eoc', 'object'].includes(typeof property)) {
            // the default required value is true.
            if (!property.hasOwnProperty('required')) property.required = false;
            return this.checkObject(property, data);
        }
    }

}
