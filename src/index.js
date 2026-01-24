const TechNewsFetcher = require('./newsFetcher');
const WeChatNotifier = require('./weChatNotifier');
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
    log('🚀 开始执行科技资讯推送任务');
    
    // 初始化新闻获取器
    const newsFetcher = new TechNewsFetcher();
    
    // 获取过去24小时的科技资讯
    const news = await newsFetcher.fetchAllNews();
    
    if (news.length === 0) {
      log('⚠️ 未获取到任何新闻，任务结束');
      return;
    }
    
    // 格式化消息
    const message = newsFetcher.formatNewsMessage(news);
    log(`📝 已格式化消息，包含 ${news.length} 条新闻`);
    
    // 初始化微信推送器
    const weChatNotifier = new WeChatNotifier();
    
    // 推送消息到微信
    log('📤 开始推送消息到微信...');
    const success = await weChatNotifier.send(message, {
      useMarkdown: false,
      fallbackToApp: true
    });
    
    if (success) {
      log('✅ 微信推送成功完成');
    } else {
      log('❌ 微信推送失败');
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