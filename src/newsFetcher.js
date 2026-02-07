const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');

class TechNewsFetcher {
  constructor() {
    this.sources = [
      {
        name: '36氪',
        url: 'https://36kr.com/',
        selector: '.news-item',
        titleSelector: '.title',
        linkSelector: 'a',
        timeSelector: '.time'
      },
      {
        name: '虎嗅',
        url: 'https://www.huxiu.com/',
        selector: '.article-item',
        titleSelector: '.title',
        linkSelector: 'a',
        timeSelector: '.time'
      },
      {
        name: 'IT之家',
        url: 'https://www.ithome.com/',
        selector: '.news-list li',
        titleSelector: '.title',
        linkSelector: 'a',
        timeSelector: '.date'
      }
    ];
  }

  async fetchNewsFromSource(source) {
    try {
      console.log(`正在从 ${source.name} 获取新闻...`);
      const response = await axios.get(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000,
        validateStatus: (status) => status === 200
      });

      const $ = cheerio.load(response.data);
      const news = [];
      
      $(source.selector).each((index, element) => {
        if (index >= 10) return false; // 限制每个源最多10条新闻
        
        const $element = $(element);
        const title = $element.find(source.titleSelector).text().trim();
        const link = $element.find(source.linkSelector).attr('href');
        const timeText = $element.find(source.timeSelector).text().trim();
        
        if (title && link) {
          let fullLink = link;
          try {
            fullLink = link.startsWith('http') ? link : new URL(link, source.url).href;
          } catch (e) {
            fullLink = link.startsWith('/') ? source.url + link : source.url + '/' + link;
          }
          const time = this.parseTime(timeText);
          
          // 只获取过去24小时的新闻
          if (this.isWithinLast24Hours(time)) {
            news.push({
              title,
              link: fullLink,
              source: source.name,
              time
            });
          }
        }
      });

      return news;
    } catch (error) {
      console.error(`❌ 获取 ${source.name} 新闻失败:`, error.message);
      if (error.response) {
        console.error(`   HTTP状态: ${error.response.status}`);
      }
      return [];
    }
  }

  parseTime(timeText) {
    // 处理各种时间格式
    if (timeText.includes('小时前')) {
      const hours = parseInt(timeText);
      return moment().subtract(hours, 'hours');
    } else if (timeText.includes('分钟前')) {
      const minutes = parseInt(timeText);
      return moment().subtract(minutes, 'minutes');
    } else if (timeText.includes('刚刚')) {
      return moment();
    } else {
      // 尝试解析具体时间
      const parsed = moment(timeText, ['MM-DD HH:mm', 'HH:mm', 'YYYY-MM-DD HH:mm']);
      return parsed.isValid() ? parsed : moment();
    }
  }

  isWithinLast24Hours(time) {
    const now = moment();
    const diff = now.diff(time, 'hours');
    return diff <= 24 && diff >= 0;
  }

  async fetchAllNews() {
    console.log('🔍 开始获取科技资讯...');
    const allNews = [];
    
    for (const source of this.sources) {
      try {
        const news = await this.fetchNewsFromSource(source);
        if (news.length > 0) {
          console.log(`✅ ${source.name}: 获取到 ${news.length} 条新闻`);
          allNews.push(...news);
        } else {
          console.log(`⚠️  ${source.name}: 未获取到新闻`);
        }
      } catch (error) {
        console.error(`❌ ${source.name} 处理失败:`, error.message);
      }
    }
    
    // 按时间排序
    allNews.sort((a, b) => b.time - a.time);
    
    console.log(`📊 共获取到 ${allNews.length} 条新闻`);
    return allNews;
  }

  formatNewsMessage(news) {
    if (news.length === 0) {
      return '📰 今日科技资讯\n\n暂无最新科技资讯。';
    }

    let message = '📰 过去24小时科技资讯\n\n';
    
    news.slice(0, 20).forEach((item, index) => {
      message += `${index + 1}. ${item.title}\n`;
      message += `   📅 ${item.time.format('MM-DD HH:mm')} | ${item.source}\n`;
      message += `   🔗 ${item.link}\n\n`;
    });
    
    message += `\n⏰ 更新时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}`;
    message += `\n📊 共 ${news.length} 条资讯`;
    
    return message;
  }
}

module.exports = TechNewsFetcher;