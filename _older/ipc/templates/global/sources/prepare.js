module.exports = async function (collection, webDistribution) {
    const promises = [];
    collection.forEach(t => promises.push(t.global.ready));
    await Promise.all(promises);

    promises.size = 0;
    collection.forEach(t => promises.push(t.global.processors.get(webDistribution()).ready));
    await Promise.all(promises);

    promises.size = 0;
    collection.forEach(t => {
        const processor = t.global.processors.get(webDistribution());
        if (!processor.valid || !processor.instance) return;
        promises.push(processor.instance.files.ready);
    });
    await Promise.all(promises);

    promises.size = 0;
    collection.forEach(t => {
        const processor = t.global.processors.get(webDistribution());
        if (!processor.valid || !processor.instance) return;
        processor.instance.files.forEach(source => promises.push(source.ready));
    });
    await Promise.all(promises);
}