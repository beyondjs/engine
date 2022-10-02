module.exports = function (errors, application) {
    console.log(`Errors found on BEE application [${application}]:`);

    const {general, bundles} = errors;
    if (general?.length) {
        console.log('General Errors:');
        general.forEach(message => console.log(`\t${message}`));
    }

    bundles.forEach((error, bundle) => {
        console.log(`Error found on bundle "${bundle}":`);
        if (typeof error === 'string') {
            console.log(`\t${error}`);
        }
        else if (error instanceof Array) {
            error.forEach(message => console.log(`\t${message}`));
        }
        else {
            require('./stack')(error);
        }
    });
}
