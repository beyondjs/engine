module.exports = async function (application, name) {
    await application.ready;
    await application.deployment.ready;
    await application.deployment.distributions.ready;

    const {distributions} = application.deployment;
    return [...distributions.values()].find(d => d.name === name);
}
