const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');

class TechNewsFetcher {
  constructor() {
    // 使用更可靠的新闻源
    this.sources = [
      {
        name: 'Hacker News',
        type: 'api',
        url: 'https://hacker-news.firebaseio.com/v0/topstories.json',
        itemUrl: 'https://hacker-news.firebaseio.com/v0/item/'
      },
      {
        name: 'GitHub Trending',
        type: 'scrape',
        url: 'https://github.com/trending',
        selector: 'article.Box-row',
        titleSelector: 'h2 a',
        linkSelector: 'h2 a',
        descSelector: 'p'
      },
      {
        name: 'Product Hunt',
        type: 'scrape',
        url: 'https://www.producthunt.com/',
        selector: '[data-test="post-item"]',
        titleSelector: 'a[href^="/posts/"]',
        linkSelector: 'a[href^="/posts/"]'
      }
    ];
  }

  async fetchHackerNews() {
    try {
      console.log('正在从 Hacker News 获取新闻...');
      const response = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json', {
        timeout: 15000
      });
      
      const topStoryIds = response.data.slice(0, 10);
      const news = [];
      
      for (const id of topStoryIds) {
        try {
          const itemResponse = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
            timeout: 5000
          });
          const item = itemResponse.data;
          
          if (item && item.title) {
            const time = moment.unix(item.time);
            if (this.isWithinLast24Hours(time)) {
              news.push({
                title: item.title,
                link: item.url || `https://news.ycombinator.com/item?id=${id}`,
                source: 'Hacker News',
                time: time,
                score: item.score || 0
              });
            }
          }
        } catch (e) {
          console.error(`获取 HN 文章 ${id} 失败:`, e.message);
        }
      }
      
      return news;
    } catch (error) {
      console.error('❌ 获取 Hacker News 失败:', error.message);
      return [];
    }
  }

  async fetchGitHubTrending() {
    try {
      console.log('正在从 GitHub Trending 获取项目...');
      const response = await axios.get('https://github.com/trending', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const news = [];
      
      $('article.Box-row').each((index, element) => {
        if (index >= 10) return false;
        
        const $element = $(element);
        const $title = $element.find('h2 a');
        const title = $title.text().trim().replace(/\s+/g, ' ');
        const link = 'https://github.com' + $title.attr('href');
        const desc = $element.find('p').text().trim();
        
        if (title && link) {
          news.push({
            title: title + (desc ? ` - ${desc.substring(0, 100)}` : ''),
            link: link,
            source: 'GitHub Trending',
            time: moment()
          });
        }
      });
      
      return news;
    } catch (error) {
      console.error('❌ 获取 GitHub Trending 失败:', error.message);
      return [];
    }
  }

  async fetchDevTo() {
    try {
      console.log('正在从 Dev.to 获取文章...');
      const response = await axios.get('https://dev.to/api/articles?per_page=10&top=1', {
        timeout: 15000
      });
      
      const news = [];
      const articles = response.data;
      
      articles.forEach(article => {
        const time = moment(article.published_at);
        if (this.isWithinLast24Hours(time)) {
          news.push({
            title: article.title,
            link: article.url,
            source: 'Dev.to',
            time: time,
            tags: article.tag_list.slice(0, 3).join(', ')
          });
        }
      });
      
      return news;
    } catch (error) {
      console.error('❌ 获取 Dev.to 失败:', error.message);
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
    
    // 并行获取所有新闻源
    const results = await Promise.allSettled([
      this.fetchHackerNews(),
      this.fetchGitHubTrending(),
      this.fetchDevTo()
    ]);
    
    results.forEach((result, index) => {
      const sources = ['Hacker News', 'GitHub Trending', 'Dev.to'];
      if (result.status === 'fulfilled' && result.value.length > 0) {
        console.log(`✅ ${sources[index]}: 获取到 ${result.value.length} 条新闻`);
        allNews.push(...result.value);
      } else if (result.status === 'fulfilled') {
        console.log(`⚠️  ${sources[index]}: 未获取到新闻`);
      } else {
        console.error(`❌ ${sources[index]} 处理失败:`, result.reason?.message);
      }
    });
    
    // 按时间排序
    allNews.sort((a, b) => b.time - a.time);
    
    console.log(`📊 共获取到 ${allNews.length} 条资讯`);
    
    // 即使没有获取到新闻，也返回一个默认消息
    return allNews;
  }

  formatNewsMessage(news) {
    if (news.length === 0) {
      return '📰 今日科技资讯\n\n暂无最新科技资讯。\n\n这可能是因为：\n- 所有新闻源暂时无法访问\n- 过去24小时内没有新内容\n\n请稍后再试。';
    }

    let message = '<h1>📰 过去24小时科技资讯</h1>\n\n';
    
    news.slice(0, 20).forEach((item, index) => {
      message += `<div style="margin-bottom: 20px; padding: 10px; border-left: 3px solid #0066cc;">\n`;
      message += `<h3>${index + 1}. ${this.escapeHtml(item.title)}</h3>\n`;
      message += `<p style="color: #666; font-size: 14px;">`;
      message += `📅 ${item.time.format('MM-DD HH:mm')} | 📌 ${item.source}`;
      if (item.score) message += ` | ⭐ ${item.score} points`;
      if (item.tags) message += ` | 🏷️ ${item.tags}`;
      message += `</p>\n`;
      message += `<p><a href="${item.link}" style="color: #0066cc;">🔗 阅读全文</a></p>\n`;
      message += `</div>\n\n`;
    });
    
    message += `<hr>\n`;
    message += `<p style="color: #999; font-size: 12px;">`;
    message += `⏰ 更新时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}<br>`;
    message += `📊 共 ${news.length} 条资讯`;
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