// 健康检查脚本 - 验证所有依赖和配置
const axios = require('axios');
const moment = require('moment');

async function healthCheck() {
  console.log('🏥 开始健康检查...\n');
  
  let allPassed = true;
  
  // 检查 Node.js 版本
  const nodeVersion = process.version;
  console.log(`✓ Node.js 版本: ${nodeVersion}`);
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 20) {
    console.error(`✗ Node.js 版本过低，需要 >= 20.0.0`);
    allPassed = false;
  }
  
  // 检查依赖包
  try {
    require('cheerio');
    console.log('✓ cheerio 已安装');
  } catch (e) {
    console.error('✗ cheerio 未安装');
    allPassed = false;
  }
  
  try {
    require('nodemailer');
    console.log('✓ nodemailer 已安装');
  } catch (e) {
    console.error('✗ nodemailer 未安装');
    allPassed = false;
  }
  
  // 检查 axios 和网络连接
  try {
    await axios.get('https://www.baidu.com', { timeout: 5000 });
    console.log('✓ axios 工作正常，网络连接正常');
  } catch (e) {
    console.error('✗ axios 或网络连接异常:', e.message);
    allPassed = false;
  }
  
  // 检查 moment
  const now = moment();
  if (now.isValid()) {
    console.log(`✓ moment 工作正常: ${now.format('YYYY-MM-DD HH:mm:ss')}`);
  } else {
    console.error('✗ moment 异常');
    allPassed = false;
  }
  
  // 检查环境变量
  console.log('\n📋 环境变量检查:');
  const envVars = [
    'WECHAT_WEBHOOK',
    'SERVER_CHAN_KEY',
    'DINGTALK_WEBHOOK',
    'SMTP_USER',
    'TO_EMAIL'
  ];
  
  let hasAnyConfig = false;
  envVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✓ ${varName} 已配置`);
      hasAnyConfig = true;
    } else {
      console.log(`- ${varName} 未配置`);
    }
  });
  
  if (!hasAnyConfig) {
    console.warn('\n⚠️  警告: 未配置任何推送方式');
  }
  
  console.log('\n' + (allPassed ? '✅ 健康检查通过' : '❌ 健康检查失败'));
  process.exit(allPassed ? 0 : 1);
}

healthCheck().catch(error => {
  console.error('健康检查异常:', error);
  process.exit(1);
});
