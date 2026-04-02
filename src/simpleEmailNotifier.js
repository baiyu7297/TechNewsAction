// 简化版邮件通知器 - 支持 QQ/163/Gmail 等多种邮箱
const https = require('https');
const { normalizeMessagePayload } = require('./messageUtils');

class SimpleEmailNotifier {
  constructor() {
    this.smtpUser = process.env.SMTP_USER;
    this.smtpPass = process.env.SMTP_PASS;
    this.toEmail = process.env.TO_EMAIL;
  }

  // 自动检测邮箱类型并返回 SMTP 配置
  getSmtpConfig() {
    const email = this.smtpUser.toLowerCase();
    
    if (email.includes('@qq.com')) {
      return {
        host: 'smtp.qq.com',
        port: 465,
        secure: true,
        service: 'QQ邮箱'
      };
    } else if (email.includes('@163.com')) {
      return {
        host: 'smtp.163.com',
        port: 465,
        secure: true,
        service: '163邮箱'
      };
    } else if (email.includes('@126.com')) {
      return {
        host: 'smtp.126.com',
        port: 465,
        secure: true,
        service: '126邮箱'
      };
    } else if (email.includes('@gmail.com')) {
      return {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        service: 'Gmail'
      };
    } else if (email.includes('@outlook.com') || email.includes('@hotmail.com')) {
      return {
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        service: 'Outlook'
      };
    } else {
      // 默认配置
      return {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        service: '通用SMTP'
      };
    }
  }

  async send(message) {
    if (!this.smtpUser || !this.smtpPass || !this.toEmail) {
      throw new Error('未配置邮件推送参数: SMTP_USER, SMTP_PASS, TO_EMAIL');
    }

    const payloadMessage = normalizeMessagePayload(message, `AI 技术情报 - ${new Date().toLocaleDateString('zh-CN')}`);

    console.log('📧 准备发送邮件...');
    console.log(`   发件人: ${this.smtpUser}`);
    console.log(`   收件人: ${this.toEmail}`);

    const smtpConfig = this.getSmtpConfig();
    console.log(`   邮箱类型: ${smtpConfig.service}`);
    console.log(`   SMTP服务器: ${smtpConfig.host}:${smtpConfig.port}`);

    // 优先尝试使用 nodemailer（如果可用）
    try {
      const nodemailer = require('nodemailer');
      if (nodemailer && typeof nodemailer.createTransport === 'function') {
        console.log('   使用 nodemailer 发送');
        return await this.sendWithNodemailer(payloadMessage, nodemailer, smtpConfig);
      }
    } catch (e) {
      console.log('   nodemailer 不可用');
    }

    // 备用方案：使用 SendGrid API（如果配置了）
    const sendgridKey = process.env.SENDGRID_API_KEY;
    if (sendgridKey) {
      console.log('   使用 SendGrid API 备用方案');
      return await this.sendWithSendGrid(payloadMessage);
    }

    console.error('❌ 无可用的邮件发送方式');
    console.log('\n解决方案：');
    console.log('1. 确保 nodemailer 已正确安装');
    console.log('2. 或配置 SENDGRID_API_KEY 作为备用方案');
    return false;
  }

  async sendWithNodemailer(message, nodemailer, smtpConfig) {
    try {
      const transportConfig = {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
          user: this.smtpUser,
          pass: this.smtpPass
        },
        tls: {
          rejectUnauthorized: false
        }
      };

      const transporter = nodemailer.createTransport(transportConfig);

      console.log('   验证 SMTP 连接...');
      await transporter.verify();
      console.log('   ✅ SMTP 连接验证成功');

      const result = await transporter.sendMail({
        from: `"AI技术资讯推送" <${this.smtpUser}>`,
        to: this.toEmail,
        subject: message.subject,
        html: message.html,
        text: message.text
      });

      console.log('✅ 邮件发送成功!');
      console.log(`   Message ID: ${result.messageId}`);
      return true;
    } catch (error) {
      console.error('❌ nodemailer 发送失败:', error.message);
      if (error.code) {
        console.error(`   错误代码: ${error.code}`);
      }
      
      // 如果配置了 SendGrid，尝试备用方案
      const sendgridKey = process.env.SENDGRID_API_KEY;
      if (sendgridKey) {
        console.log('   尝试使用 SendGrid API 备用方案...');
        return await this.sendWithSendGrid(message);
      }
      
      return false;
    }
  }

  async sendWithSendGrid(message) {
    const sendgridKey = process.env.SENDGRID_API_KEY;
    
    if (!sendgridKey) {
      console.error('❌ 未配置 SENDGRID_API_KEY');
      console.log('\n解决方案：');
      console.log('1. 访问 https://sendgrid.com/ 注册账号（免费额度：每天100封）');
      console.log('2. 创建 API Key');
      console.log('3. 在 GitHub Secrets 中添加 SENDGRID_API_KEY');
      console.log('4. 或者确保 nodemailer 正确安装');
      return false;
    }

    console.log('   使用 SendGrid API 发送邮件...');

    const emailData = {
      personalizations: [{
        to: [{ email: this.toEmail }],
        subject: message.subject
      }],
      from: { 
        email: this.smtpUser,
        name: '科技资讯推送'
      },
      content: [{
        type: 'text/html',
        value: message.html
      }]
    };

    return new Promise((resolve) => {
      const postData = JSON.stringify(emailData);
      
      const options = {
        hostname: 'api.sendgrid.com',
        path: '/v3/mail/send',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 202) {
            console.log('✅ SendGrid 邮件发送成功');
            resolve(true);
          } else {
            console.error(`❌ SendGrid 发送失败 (${res.statusCode}):`, data);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ SendGrid 请求失败:', error.message);
        resolve(false);
      });

      req.write(postData);
      req.end();
    });
  }
}

module.exports = SimpleEmailNotifier;
