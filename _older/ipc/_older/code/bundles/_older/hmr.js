module.exports = async function (bundle, distribution, resource) {
    // Check language
    const {multilanguage} = bundle;
    const check = resource.checkLanguage(multilanguage);
    if (check.error) return {errors: [check.error]};

    // Getting the packager
    const {language} = resource;
    const packager = bundle.packagers.get(distribution, language);
    await packager.ready;
    await packager.dependencies.ready;

    const promises = [];
    packager.dependencies.forEach(dependency => promises.push(dependency.ready));
    await Promise.all(promises);

    const dependencies = [...packager.dependencies]
        .filter(([, {is}]) => is.has('import'))
        .map(([resource, {kind}]) => ({resource, kind}));

    const {processors} = packager;
    await processors.ready;
    if (!processors.has(resource.processor)) {
        return {errors: [`Processor "${resource.processor}" not found on resource "${bundle.resource}"`]};
    }

    const processor = processors.get(resource.processor);
    const {hmr} = processor.packager;
    await hmr.ready;

    const {valid, errors, code, map} = hmr;
    return valid ? {is: 'processor', code, map, dependencies} : {errors};
}
