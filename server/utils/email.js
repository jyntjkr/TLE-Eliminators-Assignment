const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    // Configure with your email service provider
});

const sendInactivityEmail = async (student) => {
    const mailOptions = {
        from: 'your-email@example.com',
        to: student.email,
        subject: 'Friendly Reminder: Time to Get Back to Coding!',
        text: `Hi ${student.name},\n\nWe noticed you haven't made any submissions on Codeforces in the last 7 days. Keep up the great work and get back to problem-solving!\n\nBest,\nYour Progress Management System`
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendInactivityEmail };