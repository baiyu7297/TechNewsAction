const { main } = require('../src/index');

// 简单的测试函数
async function test() {
  console.log('🧪 开始测试科技资讯推送功能...');
  
  try {
    // 模拟环境变量（实际使用时需要在GitHub Actions中配置）
    process.env.WECHAT_WEBHOOK = process.env.WECHAT_WEBHOOK || 'test_webhook_url';
    
    // 运行主程序
    await main();
    
    console.log('✅ 测试完成');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此测试文件
if (require.main === module) {
  test();
}

module.exports = { test };