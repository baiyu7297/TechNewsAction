// 测试邮件发送功能
const SimpleEmailNotifier = require('./simpleEmailNotifier');

async function testEmail() {
  console.log('📧 开始测试邮件发送...\n');
  
  // 检查环境变量
  console.log('检查环境变量配置:');
  console.log(`SMTP_USER: ${process.env.SMTP_USER || '❌ 未配置'}`);
  console.log(`SMTP_PASS: ${process.env.SMTP_PASS ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`TO_EMAIL: ${process.env.TO_EMAIL || '❌ 未配置'}\n`);
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.TO_EMAIL) {
    console.error('❌ 缺少必要的环境变量配置');
    console.log('\n请设置以下环境变量:');
    console.log('export SMTP_USER=your_email@gmail.com');
    console.log('export SMTP_PASS=your_app_password');
    console.log('export TO_EMAIL=recipient@example.com');
    process.exit(1);
  }
  
  try {
    const notifier = new SimpleEmailNotifier();
    
    const testMessage = `
      <h1>📧 邮件测试</h1>
      <p>这是一封测试邮件，用于验证邮件推送功能是否正常工作。</p>
      <p>如果你收到这封邮件，说明配置成功！</p>
      <hr>
      <p style="color: #999; font-size: 12px;">
        发送时间: ${new Date().toLocaleString('zh-CN')}<br>
        测试来源: TechNewsAction
      </p>
    `;
    
    console.log('正在发送测试邮件...\n');
    const success = await notifier.send(testMessage);
    
    if (success) {
      console.log('\n✅ 测试成功！请检查你的邮箱。');
      process.exit(0);
    } else {
      console.log('\n❌ 测试失败，请检查配置和错误信息。');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ 测试异常:', error.message);
    console.error('完整错误:', error);
    process.exit(1);
  }
}

testEmail();
