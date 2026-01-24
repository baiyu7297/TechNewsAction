const nodemailer = require('nodemailer');

class EmailNotifier {
  constructor() {
    this.smtpHost = process.env.SMTP_HOST;
    this.smtpPort = process.env.SMTP_PORT || 587;
    this.smtpUser = process.env.SMTP_USER;
    this.smtpPass = process.env.SMTP_PASS;
    this.toEmail = process.env.TO_EMAIL;
  }

  async send(message) {
    if (!this.smtpUser || !this.smtpPass || !this.toEmail) {
      throw new Error('未配置邮件推送参数');
    }

    try {
      const transporter = nodemailer.createTransporter({
        host: this.smtpHost,
        port: this.smtpPort,
        secure: this.smtpPort === 465,
        auth: {
          user: this.smtpUser,
          pass: this.smtpPass
        }
      });

      const mailOptions = {
        from: this.smtpUser,
        to: this.toEmail,
        subject: '📰 科技资讯',
        html: message.replace(/\n/g, '<br>')
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('邮件推送成功:', result.messageId);
      return true;
    } catch (error) {
      console.error('邮件推送异常:', error.message);
      return false;
    }
  }
}

module.exports = EmailNotifier;