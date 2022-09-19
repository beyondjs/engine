module.exports = function (s) {
    let hash = 0, i, c;
    const length = s.length;

    if (length === 0) {
        return hash;
    }
    for (i = 0; i < length; i++) {
        c = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + c;
        hash = hash & hash; // Convert to 32bit integer
    }

    return hash.toString().replace('-', 'n');
};
