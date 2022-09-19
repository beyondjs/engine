module.exports = function (message, exc) {
    console.log(message);
    exc && console.error(exc.stack);
};
