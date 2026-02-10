const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');

class TechNewsFetcher {
  constructor() {
    // 使用国内可访问的 RSS 和 API
  }

  // 获取 CSDN AI 博客
  async fetchCSDNAI() {
    try {
      console.log('正在从 CSDN 获取 AI 博客...');
      const response = await axios.get('https://blog.csdn.net/nav/ai', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const news = [];
      
      $('.blog-list-box, .article-item-box, article').each((index, element) => {
        if (index >= 15) return false;
        
        const $element = $(element);
        const title = $element.find('h4, .title, h2').first().text().trim();
        const link = $element.find('a').first().attr('href');
        
        if (title && link) {
          const fullLink = link.startsWith('http') ? link : `https://blog.csdn.net${link}`;
          news.push({
            title: title,
            link: fullLink,
            source: 'CSDN AI',
            time: moment(),
            category: 'AI技术'
          });
        }
      });
      
      console.log(`✅ CSDN AI: 获取到 ${news.length} 篇文章`);
      return news;
    } catch (error) {
      console.error('❌ 获取 CSDN AI 失败:', error.message);
      return [];
    }
  }

  // 获取知乎 AI 话题
  async fetchZhihuAI() {
    try {
      console.log('正在从 知乎 获取 AI 话题...');
      // 知乎的公开 API
      const response = await axios.get('https://www.zhihu.com/api/v4/topics/19551147/feeds/timeline_activity', {
        params: {
          limit: 15,
          offset: 0
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        },
        timeout: 15000
      });

      const news = [];
      const data = response.data?.data || [];
      
      data.forEach(item => {
        const target = item.target;
        if (target && target.title) {
          const link = target.url || `https://www.zhihu.com/question/${target.id}`;
          news.push({
            title: target.title,
            link: link,
            source: '知乎AI',
            time: moment.unix(target.created || Date.now() / 1000),
            category: 'AI讨论'
          });
        }
      });
      
      console.log(`✅ 知乎AI: 获取到 ${news.length} 个话题`);
      return news;
    } catch (error) {
      console.error('❌ 获取 知乎AI 失败:', error.message);
      return [];
    }
  }

  // 获取 InfoQ AI 频道
  async fetchInfoQAI() {
    try {
      console.log('正在从 InfoQ 获取 AI 资讯...');
      const response = await axios.get('https://www.infoq.cn/topic/AI', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const news = [];
      
      $('.article-item, .news-item, article, .content-list li').each((index, element) => {
        if (index >= 15) return false;
        
        const $element = $(element);
        const title = $element.find('.title, h3, h2, a').first().text().trim();
        const link = $element.find('a').first().attr('href');
        
        if (title && link) {
          const fullLink = link.startsWith('http') ? link : `https://www.infoq.cn${link}`;
          news.push({
            title: title,
            link: fullLink,
            source: 'InfoQ AI',
            time: moment(),
            category: 'AI资讯'
          });
        }
      });
      
      console.log(`✅ InfoQ AI: 获取到 ${news.length} 条资讯`);
      return news;
    } catch (error) {
      console.error('❌ 获取 InfoQ AI 失败:', error.message);
      return [];
    }
  }

  // 获取 36氪 AI 相关新闻（使用搜索）
  async fetch36KrAI() {
    try {
      console.log('正在从 36氪 获取 AI 新闻...');
      const response = await axios.get('https://36kr.com/search/articles/AI', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const news = [];
      
      $('.article-item, .kr-flow-article, article').each((index, element) => {
        if (index >= 15) return false;
        
        const $element = $(element);
        const title = $element.find('.article-title, .title, h3, h2').first().text().trim();
        const link = $element.find('a').first().attr('href');
        
        if (title && link) {
          const fullLink = link.startsWith('http') ? link : `https://36kr.com${link}`;
          news.push({
            title: title,
            link: fullLink,
            source: '36氪',
            time: moment(),
            category: 'AI商业'
          });
        }
      });
      
      console.log(`✅ 36氪: 获取到 ${news.length} 条新闻`);
      return news;
    } catch (error) {
      console.error('❌ 获取 36氪 失败:', error.message);
      return [];
    }
  }

  // 获取 OSChina AI 资讯
  async fetchOSChinaAI() {
    try {
      console.log('正在从 OSChina 获取 AI 资讯...');
      const response = await axios.get('https://www.oschina.net/news/ai', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const news = [];
      
      $('.news-item, .item, article').each((index, element) => {
        if (index >= 15) return false;
        
        const $element = $(element);
        const title = $element.find('.title, h3, h2, a').first().text().trim();
        const link = $element.find('a').first().attr('href');
        
        if (title && link) {
          const fullLink = link.startsWith('http') ? link : `https://www.oschina.net${link}`;
          news.push({
            title: title,
            link: fullLink,
            source: 'OSChina',
            time: moment(),
            category: 'AI开源'
          });
        }
      });
      
      console.log(`✅ OSChina: 获取到 ${news.length} 条资讯`);
      return news;
    } catch (error) {
      console.error('❌ 获取 OSChina 失败:', error.message);
      return [];
    }
  }

  // 获取简单的测试数据（保底方案）
  async fetchFallbackNews() {
    console.log('使用保底新闻源...');
    return [
      {
        title: '人工智能技术发展日新月异',
        link: 'https://www.csdn.net/',
        source: '示例',
        time: moment(),
        category: 'AI'
      },
      {
        title: '大语言模型应用持续扩展',
        link: 'https://www.infoq.cn/',
        source: '示例',
        time: moment(),
        category: 'AI'
      },
      {
        title: '国内AI技术生态不断完善',
        link: 'https://36kr.com/',
        source: '示例',
        time: moment(),
        category: 'AI'
      }
    ];
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
    console.log('🔍 开始获取 AI 技术资讯...');
    const allNews = [];
    
    // 并行获取所有国内可访问的 AI 新闻源
    const results = await Promise.allSettled([
      this.fetchCSDNAI(),
      this.fetchInfoQAI(),
      this.fetch36KrAI(),
      this.fetchOSChinaAI(),
      this.fetchZhihuAI()
    ]);
    
    results.forEach((result, index) => {
      const sources = ['CSDN AI', 'InfoQ AI', '36氪', 'OSChina', '知乎AI'];
      if (result.status === 'fulfilled' && result.value.length > 0) {
        console.log(`✅ ${sources[index]}: 获取到 ${result.value.length} 条内容`);
        allNews.push(...result.value);
      } else if (result.status === 'fulfilled') {
        console.log(`⚠️  ${sources[index]}: 未获取到内容`);
      } else {
        console.error(`❌ ${sources[index]} 处理失败:`, result.reason?.message);
      }
    });
    
    // 如果所有源都失败，使用保底数据
    if (allNews.length === 0) {
      console.log('⚠️ 所有新闻源都失败，使用保底数据');
      const fallbackNews = await this.fetchFallbackNews();
      allNews.push(...fallbackNews);
    }
    
    // 按时间排序（最新的在前）
    allNews.sort((a, b) => b.time - a.time);
    
    console.log(`📊 共获取到 ${allNews.length} 条 AI 资讯`);
    
    return allNews;
  }

  formatNewsMessage(news) {
    if (news.length === 0) {
      return '🤖 今日 AI 技术资讯\n\n暂无最新 AI 资讯。\n\n这可能是因为：\n- 所有新闻源暂时无法访问\n- 今日暂无新内容\n\n请稍后再试。';
    }

    let message = '<h1>🤖 今日 AI 技术资讯</h1>\n\n';
    message += '<p style="color: #666; font-size: 14px; margin-bottom: 20px;">精选来自 CSDN、InfoQ、36氪、OSChina、知乎等国内平台的 AI 内容</p>\n\n';
    
    news.slice(0, 25).forEach((item, index) => {
      message += `<div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid #FF6B6B; background-color: #f8f9fa;">\n`;
      message += `<h3 style="margin: 0 0 10px 0; color: #333;">${index + 1}. ${this.escapeHtml(item.title)}</h3>\n`;
      message += `<p style="color: #666; font-size: 13px; margin: 5px 0;">`;
      message += `📌 ${item.source}`;
      if (item.category) message += ` | 🏷️ ${item.category}`;
      message += `</p>\n`;
      message += `<p style="margin: 10px 0 0 0;"><a href="${item.link}" style="color: #FF6B6B; text-decoration: none; font-weight: 500;">📖 阅读全文 →</a></p>\n`;
      message += `</div>\n\n`;
    });
    
    message += `<hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">\n`;
    message += `<p style="color: #999; font-size: 12px; text-align: center;">`;
    message += `⏰ 更新时间: ${moment().format('YYYY年MM月DD日 HH:mm')}<br>`;
    message += `📊 共 ${news.length} 条 AI 资讯 | 🤖 专注人工智能领域 | 🇨🇳 国内可访问`;
    message += `</p>`;
    
    return message;
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

module.exports = TechNewsFetcher;