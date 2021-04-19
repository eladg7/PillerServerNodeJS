const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'piller.inc1@gmail.com',
        pass: 'PillerPill'
    }
});

function sendMailHTML(to,subject,htmlText){
    const mailOptions = {
        from: 'piller.inc1@gmail.com',
        to: to.join(),
        subject: subject,
        html: htmlText
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            //throw error;
        } else {
            console.log('Email send: ' + info.response)
        }
    })
}


module.exports = sendMailHTML;

