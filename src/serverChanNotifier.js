const axios = require('axios');
const { normalizeMessagePayload } = require('./messageUtils');

class ServerChanNotifier {
  constructor() {
    this.sendKey = process.env.SERVER_CHAN_KEY;
  }

  async send(message) {
    if (!this.sendKey) {
      throw new Error('未配置 Server酱 SendKey');
    }

    try {
      const payloadMessage = normalizeMessagePayload(message, 'AI 技术情报');
      const url = `https://sctapi.ftqq.com/${this.sendKey}.send`;
      const payload = {
        title: payloadMessage.subject,
        desp: payloadMessage.markdown
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      });

      if (response.data.code === 0) {
        console.log('Server酱推送成功');
        return true;
      } else {
        console.error('Server酱推送失败:', response.data);
        return false;
      }
    } catch (error) {
      console.error('Server酱推送异常:', error.message);
      return false;
    }
  }
}

module.exports = ServerChanNotifier;
