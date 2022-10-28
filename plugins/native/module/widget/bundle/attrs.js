module.exports = function (attrs, warnings) {
    if (!attrs) return;

    if (!(attrs instanceof Array)) {
        warnings.push(`Element properties (attrs property of the element) must be an array`);
        return;
    }

    let valid = true;
    attrs.forEach(attr => typeof attr !== 'string' || !attr && (valid = false));
    if (!valid) {
        warnings.push(`Element attributes has at least one invalid property`);
        return;
    }

    return attrs;
}
