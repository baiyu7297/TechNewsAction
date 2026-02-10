const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');

class TechNewsFetcher {
  constructor() {
    // 中文 AI 技术新闻源
    this.sources = [
      {
        name: '机器之心',
        url: 'https://www.jiqizhixin.com/',
        selector: '.article-item, .news-item, article',
        titleSelector: '.title, h3, h2',
        linkSelector: 'a',
        timeSelector: '.time, .date, time'
      },
      {
        name: '量子位',
        url: 'https://www.qbitai.com/',
        selector: '.article-item, article, .post',
        titleSelector: '.title, h3, h2',
        linkSelector: 'a',
        timeSelector: '.time, .date'
      },
      {
        name: '36氪AI',
        url: 'https://36kr.com/search/articles/AI',
        selector: '.article-item, .kr-flow-article',
        titleSelector: '.article-title, .title',
        linkSelector: 'a',
        timeSelector: '.time, .date'
      }
    ];
  }

  // 获取机器之心新闻
  async fetchJiQiZhiXin() {
    try {
      console.log('正在从 机器之心 获取 AI 新闻...');
      const response = await axios.get('https://www.jiqizhixin.com/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const news = [];
      
      // 尝试多个可能的选择器
      const selectors = ['.article-item', '.news-item', 'article', '.post-item'];
      
      for (const selector of selectors) {
        const items = $(selector);
        if (items.length > 0) {
          items.each((index, element) => {
            if (index >= 10) return false;
            
            const $element = $(element);
            const $link = $element.find('a').first();
            const title = $element.find('.title, h3, h2, .article-title').first().text().trim();
            let link = $link.attr('href');
            
            if (title && link) {
              // 处理相对链接
              if (!link.startsWith('http')) {
                link = link.startsWith('/') ? `https://www.jiqizhixin.com${link}` : `https://www.jiqizhixin.com/${link}`;
              }
              
              news.push({
                title: title,
                link: link,
                source: '机器之心',
                time: moment(),
                category: 'AI'
              });
            }
          });
          
          if (news.length > 0) break;
        }
      }
      
      console.log(`✅ 机器之心: 获取到 ${news.length} 条新闻`);
      return news;
    } catch (error) {
      console.error('❌ 获取 机器之心 失败:', error.message);
      return [];
    }
  }

  // 获取量子位新闻
  async fetchQBitAI() {
    try {
      console.log('正在从 量子位 获取 AI 新闻...');
      const response = await axios.get('https://www.qbitai.com/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const news = [];
      
      const selectors = ['.article-item', 'article', '.post', '.news-item'];
      
      for (const selector of selectors) {
        const items = $(selector);
        if (items.length > 0) {
          items.each((index, element) => {
            if (index >= 10) return false;
            
            const $element = $(element);
            const $link = $element.find('a').first();
            const title = $element.find('.title, h3, h2, .article-title').first().text().trim();
            let link = $link.attr('href');
            
            if (title && link) {
              if (!link.startsWith('http')) {
                link = link.startsWith('/') ? `https://www.qbitai.com${link}` : `https://www.qbitai.com/${link}`;
              }
              
              news.push({
                title: title,
                link: link,
                source: '量子位',
                time: moment(),
                category: 'AI'
              });
            }
          });
          
          if (news.length > 0) break;
        }
      }
      
      console.log(`✅ 量子位: 获取到 ${news.length} 条新闻`);
      return news;
    } catch (error) {
      console.error('❌ 获取 量子位 失败:', error.message);
      return [];
    }
  }

  // 获取 AI 科技评论新闻
  async fetchAITechReview() {
    try {
      console.log('正在从 雷峰网AI科技评论 获取新闻...');
      const response = await axios.get('https://www.leiphone.com/category/ai', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const news = [];
      
      const selectors = ['.article-item', 'article', '.news-item', '.post-item'];
      
      for (const selector of selectors) {
        const items = $(selector);
        if (items.length > 0) {
          items.each((index, element) => {
            if (index >= 10) return false;
            
            const $element = $(element);
            const $link = $element.find('a').first();
            const title = $element.find('.title, h3, h2, .article-title').first().text().trim();
            let link = $link.attr('href');
            
            if (title && link) {
              if (!link.startsWith('http')) {
                link = link.startsWith('/') ? `https://www.leiphone.com${link}` : `https://www.leiphone.com/${link}`;
              }
              
              news.push({
                title: title,
                link: link,
                source: '雷峰网AI',
                time: moment(),
                category: 'AI'
              });
            }
          });
          
          if (news.length > 0) break;
        }
      }
      
      console.log(`✅ 雷峰网AI: 获取到 ${news.length} 条新闻`);
      return news;
    } catch (error) {
      console.error('❌ 获取 雷峰网AI 失败:', error.message);
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
    console.log('🔍 开始获取 AI 技术资讯...');
    const allNews = [];
    
    // 并行获取所有中文 AI 新闻源
    const results = await Promise.allSettled([
      this.fetchJiQiZhiXin(),
      this.fetchQBitAI(),
      this.fetchAITechReview()
    ]);
    
    results.forEach((result, index) => {
      const sources = ['机器之心', '量子位', '雷峰网AI'];
      if (result.status === 'fulfilled' && result.value.length > 0) {
        console.log(`✅ ${sources[index]}: 获取到 ${result.value.length} 条新闻`);
        allNews.push(...result.value);
      } else if (result.status === 'fulfilled') {
        console.log(`⚠️  ${sources[index]}: 未获取到新闻`);
      } else {
        console.error(`❌ ${sources[index]} 处理失败:`, result.reason?.message);
      }
    });
    
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
    message += '<p style="color: #666; font-size: 14px; margin-bottom: 20px;">精选来自机器之心、量子位、雷峰网等优质中文 AI 媒体</p>\n\n';
    
    news.slice(0, 20).forEach((item, index) => {
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
    message += `📊 共 ${news.length} 条 AI 资讯 | 🤖 专注人工智能领域`;
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