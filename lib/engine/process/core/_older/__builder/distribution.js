module.exports = async function (application, key) {
    await application.ready;
    await application.deployment.ready;
    await application.deployment.distributions.ready;

    const id = key.split('//')[1];
    const {distributions} = application.deployment;

    return distributions.get(parseInt(id));
}
