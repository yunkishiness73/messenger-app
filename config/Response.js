const HttpStatusCode = require('./http-status-code');

class ResponseObject {
    constructor(code, data, message, details) {
        this.code = code;
        this.data = data;
        this.message = message;
        this.details = details;
    }
}

class HttpResponse {
    createResponse(res, options = {}) {
        res.status(options.status || HttpStatusCode.OK);

        let code = options.status;
        let data = options.data || null;
        let message = options.message || '';
        let details = options.details || null;

        const resBody = new ResponseObject(code, data, message, details);

        return res.json(resBody);
    }
}

module.exports = new HttpResponse();

