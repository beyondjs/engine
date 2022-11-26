const log = {disabled: true, identifiers: false};

/**
 * For development debugging
 *
 * @param dp {object} The parent dynamic processor
 * @param child {object} The child processor
 */
module.exports = function (dp, child) {
    if (log.disabled) return;

    let pass = 0;

    // if (dp.dp === 'ts.compiler' &&
    //     dp.id === 'application//3591173269//companies/svelte//widget//ts//3026370387//.') pass++;
    // if (dp.dp === 'ts.processorCompiler') pass++;

    if (!pass) return;

    const identifiers = !log.identifiers ? '' :
        `\n\t\tIdentifiers: (dp: ${dp.autoincremented}) - (child: ${child ? child.autoincremented : 'no child'})`;

    console.log(
        `Processor "${dp.dp.bold}":"${dp.id ? dp.id : 'no id'}" reevaluation...\n` +
        (child ? `\tEmitted by: "${child.dp.bold}":"${child.id ? child.id : 'no child id'}". ` : '') + identifiers);
}
