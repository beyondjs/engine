module.exports = function (specifier) {
    'use strict';

    const split = specifier.split('/');

    if (split[0].startsWith('@') && split.length < 2) {
        return {errors: [`Dependency "${specifier}" is invalid`]};
    }

    let pkg = split[0].startsWith('@') ? `${split.shift()}/${split.shift()}` : split.shift();
    const version = /(@[0-9.]*)?$/.exec(pkg)[0]?.slice(1);
    pkg = version ? pkg.slice(0, pkg.length - version.length - 1) : pkg;

    const subpath = split.length ? split.join('/') : '';
    return {pkg, version, subpath}
}
