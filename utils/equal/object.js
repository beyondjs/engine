const generate = require('./generate');
module.exports = (o1, o2) => generate(o1) === generate(o2);
