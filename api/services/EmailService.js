const nodemailer = require('nodemailer');
const Constants = require('../constants/Constants');

class EmailService {
    constructor() {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER_NAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        this.transporter = transporter;
    }

    sendConfirmationEmail(options) {
        const url = `${Constants.BASE_URL + '/auth/confirmation/' + options.token}`;
        const mailOptions = {
            from: 'kietnguyen7398@gmail.com',
            to: `${options.to}`,
            subject: '[MESSENGER-APP] Verify your account',
            text: `<b>Email sent from Nguyen Kiet</b>`,
            html: `<b>Click this link to verify your account ${url} . This link will expire in next 5 minutes </b>`
        }

        this.sendEmail(mailOptions);
    }

    sendEmail(mailOptions) {
        return this.transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log(err);
            } else {
                console.log('Email sent ' + info.response);
            }
        })
    }


    sendConfirmationSuccessEmail(options) {
        const mailOptions = {
            from: 'kietnguyen7398@gmail.com',
            to: `${options.to}`,
            subject: '[MESSENGER-APP] Verify your account',
            text: `<b>Email sent from Nguyen Kiet</b>`,
            html: `<b>Your account have been activated successfully!</b>`
        }

        this.sendEmail(mailOptions);
    }
    
   
}

module.exports = new EmailService();