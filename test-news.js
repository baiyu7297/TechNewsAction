// 测试新闻获取功能
const TechNewsFetcher = require('./src/newsFetcher');
const NewsTranslator = require('./src/newsTranslator');

async function testNewsFetch() {
  console.log('='.repeat(80));
  console.log('开始测试新闻获取功能');
  console.log('='.repeat(80));
  console.log();

  const fetcher = new TechNewsFetcher();
  
  try {
    const rawNews = await fetcher.fetchAllNews();
    const translator = new NewsTranslator();
    const news = await translator.translateNews(rawNews);
    
    console.log();
    console.log('='.repeat(80));
    console.log(`✅ 成功获取 ${news.length} 条新闻`);
    console.log('='.repeat(80));
    console.log();
    
    if (news.length === 0) {
      console.log('❌ 未获取到任何新闻');
      return;
    }
    
    // 按来源分组统计
    const sourceCount = {};
    news.forEach(item => {
      sourceCount[item.source] = (sourceCount[item.source] || 0) + 1;
    });
    
    console.log('📊 新闻来源统计:');
    Object.entries(sourceCount).forEach(([source, count]) => {
      console.log(`   ${source}: ${count} 条`);
    });
    console.log();
    
    // 显示前 10 条新闻
    console.log('📰 前 10 条新闻预览:');
    console.log('-'.repeat(80));
    news.slice(0, 10).forEach((item, index) => {
      const displayTitle = item.translatedTitle || item.title;
      console.log();
      console.log(`${index + 1}. ${displayTitle}`);
      if (item.translatedTitle && item.originalTitle) {
        console.log(`   原文标题: ${item.originalTitle}`);
      }
      console.log(`   来源: ${item.source} | 分类: ${item.category || '无'}`);
      if (item.translatedSummary || item.summary) {
        console.log(`   ${item.translatedSummary ? '中文摘要' : '摘要'}: ${item.translatedSummary || item.summary}`);
      }
      console.log(`   原文链接: ${item.link}`);
      console.log(`   时间: ${item.time.format('YYYY-MM-DD HH:mm:ss')}`);
    });
    console.log();
    console.log('-'.repeat(80));
    
    // 生成邮件预览
    console.log();
    console.log('📧 邮件内容预览（HTML）:');
    console.log('-'.repeat(80));
    const message = fetcher.formatNewsMessage(news);
    // 显示前 500 个字符
    console.log(message.substring(0, 500) + '...');
    console.log('-'.repeat(80));
    
    console.log();
    console.log('✅ 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error(error.stack);
  }
}

testNewsFetch();
