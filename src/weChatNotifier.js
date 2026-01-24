const axios = require('axios');

class WeChatNotifier {
  constructor() {
    this.webhookUrl = process.env.WECHAT_WEBHOOK;
    this.appId = process.env.WECHAT_APP_ID;
    this.appSecret = process.env.WECHAT_APP_SECRET;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // 企业微信机器人推送
  async sendByWebhook(message) {
    if (!this.webhookUrl) {
      throw new Error('未配置企业微信机器人 Webhook URL');
    }

    try {
      const payload = {
        msgtype: 'text',
        text: {
          content: message
        }
      };

      const response = await axios.post(this.webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.errcode === 0) {
        console.log('企业微信机器人推送成功');
        return true;
      } else {
        console.error('企业微信机器人推送失败:', response.data);
        return false;
      }
    } catch (error) {
      console.error('企业微信机器人推送异常:', error.message);
      return false;
    }
  }

  // 获取企业微信访问令牌
  async getAccessToken() {
    if (!this.appId || !this.appSecret) {
      throw new Error('未配置企业微信应用 ID 和 Secret');
    }

    // 检查token是否仍然有效
    if (this.accessToken && this.tokenExpiry && moment().isBefore(this.tokenExpiry)) {
      return this.accessToken;
    }

    try {
      const url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${this.appId}&corpsecret=${this.appSecret}`;
      const response = await axios.get(url, { timeout: 10000 });

      if (response.data.errcode === 0) {
        this.accessToken = response.data.access_token;
        // token有效期7200秒，提前5分钟刷新
        this.tokenExpiry = moment().add(7150, 'seconds');
        console.log('企业微信访问令牌获取成功');
        return this.accessToken;
      } else {
        throw new Error(`获取访问令牌失败: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('获取企业微信访问令牌异常:', error.message);
      throw error;
    }
  }

  // 企业微信应用推送
  async sendByApp(message, touser = '@all') {
    try {
      const accessToken = await this.getAccessToken();
      
      const payload = {
        touser,
        agentid: process.env.WECHAT_AGENT_ID || '1000001',
        msgtype: 'text',
        text: {
          content: message
        },
        safe: 0
      };

      const url = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${accessToken}`;
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.errcode === 0) {
        console.log('企业微信应用推送成功');
        return true;
      } else {
        console.error('企业微信应用推送失败:', response.data);
        return false;
      }
    } catch (error) {
      console.error('企业微信应用推送异常:', error.message);
      return false;
    }
  }

  // 发送Markdown格式消息（仅支持企业微信机器人）
  async sendMarkdown(markdown) {
    if (!this.webhookUrl) {
      throw new Error('未配置企业微信机器人 Webhook URL');
    }

    try {
      const payload = {
        msgtype: 'markdown',
        markdown: {
          content: markdown
        }
      };

      const response = await axios.post(this.webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.errcode === 0) {
        console.log('企业微信Markdown推送成功');
        return true;
      } else {
        console.error('企业微信Markdown推送失败:', response.data);
        return false;
      }
    } catch (error) {
      console.error('企业微信Markdown推送异常:', error.message);
      return false;
    }
  }

  // 智能推送：优先使用Webhook，失败时尝试应用推送
  async send(message, options = {}) {
    const { useMarkdown = false, fallbackToApp = true } = options;

    try {
      // 优先使用企业微信机器人
      if (this.webhookUrl) {
        if (useMarkdown) {
          return await this.sendMarkdown(message);
        } else {
          return await this.sendByWebhook(message);
        }
      } else if (fallbackToApp && this.appId && this.appSecret) {
        // 回退到企业微信应用
        return await this.sendByApp(message, options.touser);
      } else {
        throw new Error('未配置任何微信推送方式');
      }
    } catch (error) {
      console.error('微信推送失败:', error.message);
      
      // 如果启用了回退机制且当前使用的是Webhook，尝试应用推送
      if (fallbackToApp && this.webhookUrl && this.appId && this.appSecret) {
        console.log('尝试使用企业微信应用回退推送...');
        return await this.sendByApp(message, options.touser);
      }
      
      throw error;
    }
  }
}

module.exports = WeChatNotifier;