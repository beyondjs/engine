module.exports = function (required) {
    'use strict';

    const process = pkg => {
        let [scope, name, subpath] = pkg.split('/');
        name = name.includes('@') ? name.split('@')[0] : name;
        return `${scope}/${name}/${subpath}`;
    };
    return required.find(pkg => process(pkg) === '@beyond-js/local/main');
}