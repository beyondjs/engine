/**
 *
 * @param entries to get backend
 * @param type of service require
 * @returns {application | library..., application | library} Applications or Library Object
 */
module.exports = async (entries, type) => {
    const beesIds = [];
    const ids = Object.keys(entries);
    ids.forEach(id => beesIds.push(`${type}/${id}`));

    const bees = await global.utils.ipc.exec('main', 'bees/data', beesIds);
    for (const item of Object.values(entries)) {
        const id = `${type}/${item.id}`;
        item.bee = bees.hasOwnProperty(id) ? id : undefined;
    }

    return entries;
};
