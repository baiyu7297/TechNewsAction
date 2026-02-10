const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');

class TechNewsFetcher {
  constructor() {
    // 使用 RSS 和公开 API，更稳定可靠
  }

  // 获取 36氪 AI 相关新闻（通过 RSS）
  async fetch36KrAI() {
    try {
      console.log('正在从 36氪 获取 AI 新闻...');
      // 36氪的 RSS 源
      const response = await axios.get('https://36kr.com/feed', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data, { xmlMode: true });
      const news = [];
      
      $('item').each((index, element) => {
        if (index >= 15) return false;
        
        const $element = $(element);
        const title = $element.find('title').text().trim();
        const link = $element.find('link').text().trim();
        const pubDate = $element.find('pubDate').text().trim();
        const description = $element.find('description').text().trim();
        
        // 只保留 AI 相关的新闻
        const aiKeywords = ['AI', '人工智能', '大模型', 'GPT', '机器学习', '深度学习', '智能', 'ChatGPT', 'LLM', '算法'];
        const isAIRelated = aiKeywords.some(keyword => 
          title.includes(keyword) || description.includes(keyword)
        );
        
        if (title && link && isAIRelated) {
          news.push({
            title: title,
            link: link,
            source: '36氪',
            time: pubDate ? moment(pubDate) : moment(),
            category: 'AI'
          });
        }
      });
      
      console.log(`✅ 36氪: 获取到 ${news.length} 条 AI 相关新闻`);
      return news;
    } catch (error) {
      console.error('❌ 获取 36氪 失败:', error.message);
      return [];
    }
  }

  // 获取 GitHub AI 相关的热门项目
  async fetchGitHubAI() {
    try {
      console.log('正在从 GitHub 获取 AI 项目...');
      const response = await axios.get('https://api.github.com/search/repositories', {
        params: {
          q: 'AI OR machine-learning OR deep-learning OR LLM OR GPT language:Python stars:>1000',
          sort: 'updated',
          order: 'desc',
          per_page: 10
        },
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Mozilla/5.0'
        },
        timeout: 15000
      });

      const news = [];
      const items = response.data.items || [];
      
      items.forEach(item => {
        const updatedAt = moment(item.updated_at);
        // 只获取最近更新的项目
        if (moment().diff(updatedAt, 'days') <= 7) {
          news.push({
            title: `${item.full_name} - ${item.description || ''}`,
            link: item.html_url,
            source: 'GitHub AI',
            time: updatedAt,
            stars: item.stargazers_count,
            category: 'AI开源项目'
          });
        }
      });
      
      console.log(`✅ GitHub AI: 获取到 ${news.length} 个项目`);
      return news;
    } catch (error) {
      console.error('❌ 获取 GitHub AI 失败:', error.message);
      return [];
    }
  }

  // 获取 Hacker News 上的 AI 相关讨论
  async fetchHackerNewsAI() {
    try {
      console.log('正在从 Hacker News 获取 AI 讨论...');
      const response = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json', {
        timeout: 15000
      });
      
      const topStoryIds = response.data.slice(0, 30);
      const news = [];
      
      for (const id of topStoryIds) {
        try {
          const itemResponse = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
            timeout: 5000
          });
          const item = itemResponse.data;
          
          if (item && item.title) {
            // 只保留 AI 相关的讨论
            const aiKeywords = ['AI', 'GPT', 'LLM', 'Machine Learning', 'Deep Learning', 'Neural', 'ChatGPT', 'OpenAI', 'Anthropic', 'Claude'];
            const isAIRelated = aiKeywords.some(keyword => 
              item.title.toLowerCase().includes(keyword.toLowerCase())
            );
            
            if (isAIRelated) {
              const time = moment.unix(item.time);
              if (moment().diff(time, 'hours') <= 48) {
                news.push({
                  title: item.title,
                  link: item.url || `https://news.ycombinator.com/item?id=${id}`,
                  source: 'Hacker News',
                  time: time,
                  score: item.score || 0,
                  category: 'AI讨论'
                });
              }
            }
          }
        } catch (e) {
          // 忽略单个文章的错误
        }
        
        if (news.length >= 10) break;
      }
      
      console.log(`✅ Hacker News: 获取到 ${news.length} 条 AI 相关讨论`);
      return news;
    } catch (error) {
      console.error('❌ 获取 Hacker News 失败:', error.message);
      return [];
    }
  }

  // 获取 Reddit AI 子版块的热门内容
  async fetchRedditAI() {
    try {
      console.log('正在从 Reddit AI 获取内容...');
      const response = await axios.get('https://www.reddit.com/r/artificial/hot.json', {
        params: {
          limit: 15
        },
        headers: {
          'User-Agent': 'Mozilla/5.0'
        },
        timeout: 15000
      });

      const news = [];
      const posts = response.data?.data?.children || [];
      
      posts.forEach(post => {
        const data = post.data;
        if (data.title && !data.stickied) {
          news.push({
            title: data.title,
            link: data.url.startsWith('http') ? data.url : `https://reddit.com${data.permalink}`,
            source: 'Reddit AI',
            time: moment.unix(data.created_utc),
            score: data.score,
            category: 'AI社区'
          });
        }
      });
      
      console.log(`✅ Reddit AI: 获取到 ${news.length} 条内容`);
      return news;
    } catch (error) {
      console.error('❌ 获取 Reddit AI 失败:', error.message);
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
    
    // 并行获取所有 AI 新闻源（使用公开 API 和 RSS，更稳定）
    const results = await Promise.allSettled([
      this.fetch36KrAI(),
      this.fetchGitHubAI(),
      this.fetchHackerNewsAI(),
      this.fetchRedditAI()
    ]);
    
    results.forEach((result, index) => {
      const sources = ['36氪AI', 'GitHub AI', 'Hacker News AI', 'Reddit AI'];
      if (result.status === 'fulfilled' && result.value.length > 0) {
        console.log(`✅ ${sources[index]}: 获取到 ${result.value.length} 条内容`);
        allNews.push(...result.value);
      } else if (result.status === 'fulfilled') {
        console.log(`⚠️  ${sources[index]}: 未获取到内容`);
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
    message += '<p style="color: #666; font-size: 14px; margin-bottom: 20px;">精选来自 36氪、GitHub、Hacker News、Reddit 等平台的 AI 相关内容</p>\n\n';
    
    news.slice(0, 25).forEach((item, index) => {
      message += `<div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid #FF6B6B; background-color: #f8f9fa;">\n`;
      message += `<h3 style="margin: 0 0 10px 0; color: #333;">${index + 1}. ${this.escapeHtml(item.title)}</h3>\n`;
      message += `<p style="color: #666; font-size: 13px; margin: 5px 0;">`;
      message += `📌 ${item.source}`;
      if (item.category) message += ` | 🏷️ ${item.category}`;
      if (item.score) message += ` | ⭐ ${item.score} 分`;
      if (item.stars) message += ` | ⭐ ${item.stars} stars`;
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