const nodeMailer = require('nodemailer');
const { options } = require('../routes/productRoute');
const sendEmail = async (options) => {
    const transporter = nodeMailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'roshan.jha@hih7.in',
            pass: 'roshan@hih7'
        }
    })
    const mailOptions = {
        from: 'roshan.jha@hih7.in',
        to: 'roshan.jha@hih7.in',
        subject: 'for email testing',
        text: "hello from youtube"
    }

    await transporter.sendMail(mailOptions, function (err, data) {
        console.log();
        if (err) {
            console.log('Error Occurs');
        } else {
            console.log('Email sent successfully');
        }
    })
}

module.exports = sendEmail