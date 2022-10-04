const {URL} = require('url');

module.exports = packages => async function (request, response) {
    console.log(request.url);
}
