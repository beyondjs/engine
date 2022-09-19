/**
 *
 * @param collection
 * @returns {Promise<void>}
 */
module.exports = async function (collection) {
    await collection.ready;

    const promises = [];
    collection.forEach(template => promises.push(template.processors.ready));
    await Promise.all(promises);

    promises.size = 0;
    collection.forEach(template => template.processors.forEach(processor => promises.push(processor.ready)));
    await Promise.all(promises);
}