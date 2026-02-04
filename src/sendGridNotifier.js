const nodemailer = require('nodemailer');

class SendGridNotifier {
  constructor() {
    this.sendGridApiKey = process.env.SENDGRID_API_KEY;
    this.fromEmail = process.env.FROM_EMAIL;
    this.toEmail = process.env.TO_EMAIL;
  }

  async send(message) {
    if (!this.sendGridApiKey || !this.fromEmail || !this.toEmail) {
      throw new Error('未配置 SendGrid 参数');
    }

    try {
      const transporter = nodemailer.createTransporter({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: this.sendGridApiKey
        }
      });

      const mailOptions = {
        from: this.fromEmail,
        to: this.toEmail,
        subject: '📰 科技资讯',
        html: message.replace(/\n/g, '<br>')
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('SendGrid邮件推送成功:', result.messageId);
      return true;
    } catch (error) {
      console.error('SendGrid邮件推送异常:', error.message);
      return false;
    }
  }
}

module.exports = SendGridNotifier;