/**
 * Native BeyondJS bundles
 */

const bundles = [];

try {
    bundles.push(require('./ts'));
    bundles.push(require('./bridge'));
    bundles.push(require('./code'));
    bundles.push(require('./sass'));
    bundles.push(require('./widget'));
    bundles.push(require('./txt'));
    bundles.push(require('./start'));

    // Legacy bundles
    bundles.push(require('./js'));
    bundles.push(require('./jsx'));
    bundles.push(require('./page'));
    bundles.push(require('./layout'));
}
catch (exc) {
    console.error(exc.stack);
    bundles.length = 0;
}

module.exports = bundles;
