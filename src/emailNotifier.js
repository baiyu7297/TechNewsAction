const nodemailer = require('nodemailer');

class EmailNotifier {
  constructor() {
    this.smtpHost = process.env.SMTP_HOST;
    this.smtpPort = process.env.SMTP_PORT || 587;
    this.smtpUser = process.env.SMTP_USER;
    this.smtpPass = process.env.SMTP_PASS;
    this.toEmail = process.env.TO_EMAIL;
    this.gmailClientId = process.env.GMAIL_CLIENT_ID;
    this.gmailClientSecret = process.env.GMAIL_CLIENT_SECRET;
    this.gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN;
  }

  async send(message) {
    if (!this.smtpUser || !this.smtpPass || !this.toEmail) {
      const missing = [];
      if (!this.smtpUser) missing.push('SMTP_USER');
      if (!this.smtpPass) missing.push('SMTP_PASS');
      if (!this.toEmail) missing.push('TO_EMAIL');
      throw new Error(`未配置邮件推送参数: ${missing.join(', ')}`);
    }

    try {
      console.log(`📧 准备发送邮件...`);
      console.log(`   发件人: ${this.smtpUser}`);
      console.log(`   收件人: ${this.toEmail}`);
      console.log(`   SMTP服务器: ${this.smtpHost}:${this.smtpPort}`);
      
      const transportConfig = {
        host: this.smtpHost,
        port: parseInt(this.smtpPort),
        secure: parseInt(this.smtpPort) === 465,
        auth: {
          user: this.smtpUser,
          pass: this.smtpPass
        }
      };
      
      // Gmail 特殊配置
      if (this.smtpHost && this.smtpHost.includes('gmail')) {
        transportConfig.service = 'gmail';
        console.log('   使用 Gmail 服务');
      }
      
      const transporter = nodemailer.createTransporter(transportConfig);

      // 验证连接
      console.log('   验证 SMTP 连接...');
      await transporter.verify();
      console.log('   ✅ SMTP 连接验证成功');

      const mailOptions = {
        from: `"科技资讯推送" <${this.smtpUser}>`,
        to: this.toEmail,
        subject: `📰 科技资讯 - ${new Date().toLocaleDateString('zh-CN')}`,
        html: message,
        text: message.replace(/<[^>]*>/g, '') // 纯文本备用
      };

      console.log('   发送邮件中...');
      const result = await transporter.sendMail(mailOptions);
      console.log('✅ 邮件推送成功!');
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   Response: ${result.response}`);
      return true;
    } catch (error) {
      console.error('❌ 邮件推送失败:', error.message);
      if (error.code) {
        console.error(`   错误代码: ${error.code}`);
      }
      if (error.command) {
        console.error(`   失败命令: ${error.command}`);
      }
      console.error('   完整错误:', error);
      return false;
    }
  }
}

module.exports = EmailNotifier;