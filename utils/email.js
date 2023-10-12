/**
 * Module to send an email
 */

const nodemailer = require("nodemailer");

const message = "Hi there, you were emailed me through nodemailer";

const options = {
    from: `essencefr-backend <${process.env.GIT_GMAIL_ADDR}>`, // sender address
    to: process.env.ESSENCEFR_EMAIL_ADDR, // receiver email
    subject: "Send email in Node.JS with Nodemailer using Gmail account", // Subject line
    text: message,
    html: message,
    attachments: [
        { // file on disk as an attachment
            filename: 'text3.txt',
            path: './_temp/temp.txt' // stream this file
        }
    ]
}

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.GIT_GMAIL_ADDR,
        pass: process.env.GIT_GMAIL_PWD,
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


// send mail with defined transport object and mail options
// sendMail(options, (info) => {
//   console.log("Email sent successfully");
//   console.log("MESSAGE ID: ", info.messageId);
// });

module.exports.sendMail = sendMail;