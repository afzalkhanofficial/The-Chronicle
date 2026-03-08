// This is a basic placeholder for sending emails.
// For a real production app, you would use a package like 'nodemailer' here.

const sendEmailNotification = (to, subject, text) => {
    console.log(`\n--- NEW EMAIL NOTIFICATION ---`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${text}`);
    console.log(`------------------------------\n`);
};

module.exports = sendEmailNotification;
