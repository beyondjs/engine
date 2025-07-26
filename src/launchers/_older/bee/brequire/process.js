module.exports = function (uri, {errors, bundle}) {
    if (errors) {
        throw new Error(`Resource "${uri}" has been imported with errors: ${errors}`);
    }
    if (bundle?.exc) {
        throw bundle.exc;
    }

    return bundle?.exports;
}
