module.exports = function (file) {
    const split = file.substr(1).split('/');
    if (split[0].startsWith('@') && split.length < 2) return {};
    const pkg = split[0].startsWith('@') ? `${split.shift()}/${split.shift()}` : split.shift();

    const subpath = split.join('/');

    if (split.length < 3) return {pkg, subpath};

    const module = {name: split.shift()};
    const bundle = {name: split.shift()};
    if (bundle.name !== 'sass' && split.shift() !== 'sass') return {pkg, subpath};

    module.resource = `${pkg}/${module.name}`;
    bundle.resource = `${module.resource}/${bundle.name}`;

    return {pkg, module, bundle, file: `${split.join('/')}.scss`};
}
