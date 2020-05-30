const HttpResponse = require('./Response');

module.exports = function sendResponse(res, options) {
    HttpResponse.createResponse(res, options);
}