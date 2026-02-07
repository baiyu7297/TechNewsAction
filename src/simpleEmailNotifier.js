// 简化版邮件通知器 - 使用原生 HTTPS 模块
const https = require('https');

class SimpleEmailNotifier {
  constructor() {
    this.smtpUser = process.env.SMTP_USER;
    this.smtpPass = process.env.SMTP_PASS;
    this.toEmail = process.env.TO_EMAIL;
  }

  async send(message) {
    if (!this.smtpUser || !this.smtpPass || !this.toEmail) {
      throw new Error('未配置邮件推送参数');
    }

    // 尝试使用 nodemailer
    try {
      const nodemailer = require('nodemailer');
      
      if (nodemailer && typeof nodemailer.createTransport === 'function') {
        return await this.sendWithNodemailer(message, nodemailer);
      } else {
        console.warn('⚠️  nodemailer 不可用，使用备用方案');
        return await this.sendWithMailgun(message);
      }
    } catch (error) {
      console.error('❌ nodemailer 加载失败:', error.message);
      console.log('尝试使用备用邮件发送方案...');
      return await this.sendWithMailgun(message);
    }
  }

  async sendWithNodemailer(message, nodemailer) {
    console.log('📧 使用 nodemailer 发送邮件...');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.smtpUser,
        pass: this.smtpPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.verify();
    console.log('✅ SMTP 连接验证成功');

    const result = await transporter.sendMail({
      from: `"科技资讯" <${this.smtpUser}>`,
      to: this.toEmail,
      subject: `📰 科技资讯 - ${new Date().toLocaleDateString('zh-CN')}`,
      html: message
    });

    console.log('✅ 邮件发送成功:', result.messageId);
    return true;
  }

  async sendWithMailgun(message) {
    console.log('📧 使用 Mailgun API 发送邮件...');
    
    // 如果配置了 Mailgun
    const mailgunKey = process.env.MAILGUN_API_KEY;
    const mailgunDomain = process.env.MAILGUN_DOMAIN;
    
    if (!mailgunKey || !mailgunDomain) {
      console.error('❌ 未配置 Mailgun，无法使用备用方案');
      console.log('提示：请在 GitHub Secrets 中添加 MAILGUN_API_KEY 和 MAILGUN_DOMAIN');
      return false;
    }

    const formData = new URLSearchParams({
      from: `科技资讯 <mailgun@${mailgunDomain}>`,
      to: this.toEmail,
      subject: `📰 科技资讯 - ${new Date().toLocaleDateString('zh-CN')}`,
      html: message
    });

    const auth = Buffer.from(`api:${mailgunKey}`).toString('base64');

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.mailgun.net',
        path: `/v3/${mailgunDomain}/messages`,
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': formData.toString().length
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log('✅ Mailgun 邮件发送成功');
            resolve(true);
          } else {
            console.error('❌ Mailgun 发送失败:', data);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Mailgun 请求失败:', error.message);
        resolve(false);
      });

      req.write(formData.toString());
      req.end();
    });
  }
}

module.exports = SimpleEmailNotifier;
