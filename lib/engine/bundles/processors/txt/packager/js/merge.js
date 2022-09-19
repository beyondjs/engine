const merge = function (o1, o2) {
    for (const prop in o2) {
        if (!o2.hasOwnProperty(prop)) continue;
        typeof o1[prop] === 'object' && typeof o2[prop] === 'object' ?
            merge(o1[prop], o2[prop]) :
            o1[prop] = o2[prop];
    }
    return o1;
}

module.exports = merge;
