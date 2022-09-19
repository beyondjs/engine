const equal = function (v1, v2) {
    if (typeof v1 !== typeof v2) return false;
    if (typeof v1 !== 'object') return v1 === v2;

    if (v1 instanceof Array || v2 instanceof Array) {
        // The two values must be arrays
        if (!(v1 instanceof Array) || !(v2 instanceof Array)) return false;

        // Compare the two arrays
        return require('./array')(v1, v2);
    }
    else {
        // Compare the two objects
        return require('./object.js')(v1, v2);
    }
}

equal.generate = require('./generate');

module.exports = equal;
