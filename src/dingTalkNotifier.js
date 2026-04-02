const axios = require('axios');
const { normalizeMessagePayload } = require('./messageUtils');

class DingTalkNotifier {
  constructor() {
    this.webhookUrl = process.env.DINGTALK_WEBHOOK;
  }

  async send(message) {
    if (!this.webhookUrl) {
      throw new Error('未配置钉钉机器人 Webhook URL');
    }

    try {
      const payloadMessage = normalizeMessagePayload(message, 'AI 技术情报');
      const payload = {
        msgtype: 'text',
        text: {
          content: payloadMessage.text
        }
      };

      const response = await axios.post(this.webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.errcode === 0) {
        console.log('钉钉推送成功');
        return true;
      } else {
        console.error('钉钉推送失败:', response.data);
        return false;
      }
    } catch (error) {
      console.error('钉钉推送异常:', error.message);
      return false;
    }
  }
}

module.exports = DingTalkNotifier;
