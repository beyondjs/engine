/**
 * This file centralizes the imports from the beyond/engine repository required to
 * create tests cases of the builder.
 *
 * The imports are:
 * global engine
 *
 *
 * @type {string}
 */

const engine = `../../..`;
const path = `${engine}/inspect/service/builder/models`;
require(`${engine}/global`);



module.exports = require(`${path}`);

