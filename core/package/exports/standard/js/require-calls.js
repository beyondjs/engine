module.exports = function (plugin) {
    const {externals} = plugin;
    const requires = [...externals]
        .filter(([, is]) => {
            return is.has('require-call') && !is.has('import-statement');
        })
        .map(([specifier]) => specifier);

    if (!requires.length) return {};

    let imports = '';
    let dependencies = '[';
    requires.forEach((specifier, index) => {
        const variable = `__dependency_${index}`;
        imports += `import ${variable} from '${specifier}';\n`;

        dependencies += index !== 0 ? ', ' : '';
        dependencies += `['${specifier}', ${variable}]`;
    })
    dependencies += ']';

    let resolver = '';
    resolver += 'const __beyond_externals = new Map(' + dependencies + ');\n';
    resolver += 'const __beyond_resolve_external = (dependency) => __beyond_externals.get(dependency);\n';

    return {imports, resolver};
}