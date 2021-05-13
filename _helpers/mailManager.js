const nodemailer = require('nodemailer');
const consts = require('../_helpers/consts');

const transporter = nodemailer.createTransport({
    service: consts.mail.service,
    auth: {
        user: consts.mail.user,
        pass: consts.mail.password
    }
});

function sendMailHTML(to, subject, htmlText) {
    const mailOptions = {
        from: consts.mail.user,
        to: to.join(),
        subject: subject,
        html: htmlText
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            //throw error;
        } else {
            console.log(consts.mail.emailSent + info.response)
        }
    })
}


module.exports = sendMailHTML;

