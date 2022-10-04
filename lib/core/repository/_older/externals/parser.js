module.exports = function (pathname) {
    // Remove the /packages/ string at the beginning of the pathname
    const bundle = pathname.substr(10);
    const split = bundle.split('/');

    let pkg = split[0].startsWith('@') ? `${split.shift()}/${split.shift()}` : split.shift();
    const version = /(@[0-9.]*)?$/.exec(pkg)[0]?.slice(1);
    pkg = version ? pkg.slice(0, pkg.length - version.length - 1) : pkg;

    const subpath = split.length ? split.join('/') : '';
    return {bundle, pkg, version, subpath};
}
