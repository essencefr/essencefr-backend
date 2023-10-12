/**
 * Module to send an email
 */

const config = require('config');
const nodemailer = require("nodemailer");

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: config.get('gitEmailAddr'),
        pass: config.get('gitEmailPwd'),
    },
});

/** create reusable sendmail function 
@params {object} options - mail options (to, subject, text, html)
@params {function} callback - callback function to handle response
*/
async function sendMail(options, callback = null) {
    try {
        const info = await transporter.sendMail(options)
        if (callback) callback(info);
    } catch (error) {
        console.log(error);
    }
};

module.exports.sendMail = sendMail;