const moment = require('moment');

class DateUtil {
    getNow() {
        return moment().toDate();
    }

    formatDate(date, format, isUTC) {
        if (date === null || date === '') return '';
        if (isUTC) {
            return moment.utc(date).format(format);
        }

        return moment(date).format(format);
    }
}

module.exports = new DateUtil();