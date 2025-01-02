const {extname} = require('path');

module.exports = function (pathname) {
    // Remove the /packages/ string at the beginning of the pathname
    const resource = pathname.substr(10);

    const ext = (() => {
        if (pathname.endsWith('.js.map')) return '.js.map';
        if (pathname.endsWith('.d.ts')) return '.d.ts';
        return extname(pathname);
    })();

    const split = resource.split('/');
    let pkg = split[0].startsWith('@') ? `${split.shift()}/${split.shift()}` : split.shift();
    const version = /(@[0-9.]*)?$/.exec(pkg)[0]?.slice(1);
    pkg = version ? pkg.slice(0, pkg.length - version.length - 1) : pkg;

    let subpath = split.length ? split.join('/') : '';
    subpath = subpath.slice(0, subpath.length - ext.length);

    return {resource, pkg, version, subpath, ext};
}
