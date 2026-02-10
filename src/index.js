const TechNewsFetcher = require('./newsFetcher');
const WeChatNotifier = require('./weChatNotifier');
const ServerChanNotifier = require('./serverChanNotifier');
const SimpleEmailNotifier = require('./simpleEmailNotifier');
const DingTalkNotifier = require('./dingTalkNotifier');
const fs = require('fs');
const path = require('path');

// 确保日志目录存在
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 日志函数
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  
  // 写入日志文件
  const logFile = path.join(logDir, `tech-news-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logMessage + '\n');
}

async function main() {
  try {
    log('🚀 开始执行 AI 技术资讯推送任务');
    
    // 初始化新闻获取器
    const newsFetcher = new TechNewsFetcher();
    
    // 获取最新的 AI 技术资讯
    const news = await newsFetcher.fetchAllNews();
    
    // 格式化消息（即使没有新闻也会生成消息）
    const message = newsFetcher.formatNewsMessage(news);
    log(`📝 已格式化消息，包含 ${news.length} 条 AI 资讯`);
    
    if (news.length === 0) {
      log('⚠️ 未获取到任何 AI 资讯，但仍会发送通知');
    }
    
    // 智能选择推送方式
    let success = false;
    let pushMethod = '';
    
    // 优先级：Server酱 > 企业微信 > 钉钉 > 邮件
    if (process.env.SERVER_CHAN_KEY) {
      const notifier = new ServerChanNotifier();
      log('📤 使用 Server酱 推送消息...');
      success = await notifier.send(message);
      pushMethod = 'Server酱';
    } else if (process.env.WECHAT_WEBHOOK || process.env.WECHAT_APP_ID) {
      const notifier = new WeChatNotifier();
      log('📤 使用企业微信推送消息...');
      success = await notifier.send(message, {
        useMarkdown: false,
        fallbackToApp: true
      });
      pushMethod = '企业微信';
    } else if (process.env.DINGTALK_WEBHOOK) {
      const notifier = new DingTalkNotifier();
      log('📤 使用钉钉推送消息...');
      success = await notifier.send(message);
      pushMethod = '钉钉';
    } else if (process.env.SMTP_USER && process.env.TO_EMAIL) {
      const notifier = new SimpleEmailNotifier();
      log('📤 使用邮件推送消息...');
      success = await notifier.send(message);
      pushMethod = '邮件';
    } else {
      log('❌ 未配置任何推送方式');
      throw new Error('请配置至少一种推送方式');
    }
    
    if (success) {
      log(`✅ ${pushMethod}推送成功完成`);
    } else {
      log(`❌ ${pushMethod}推送失败`);
      process.exit(1);
    }
    
  } catch (error) {
    log(`💥 执行过程中发生错误: ${error.message}`);
    log(`错误堆栈: ${error.stack}`);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('未捕获的错误:', error);
    process.exit(1);
  });
}

module.exports = { main };