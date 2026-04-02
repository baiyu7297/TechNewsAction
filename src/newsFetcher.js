const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');
const { AI_NEWS_SOURCES, SOURCE_LIMITS } = require('./newsSources');
const { stripHtml, decodeHtmlEntities } = require('./messageUtils');

const COMMON_HEADERS = {
  'User-Agent': 'TechNewsAction/2.0 (+https://github.com/)',
  'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7'
};

const BAD_TITLE_PATTERNS = [
  /^内容反馈$/i,
  /^feedback$/i,
  /^subscribe$/i,
  /^advertisement$/i,
  /^advertorial$/i,
  /^job(s)?$/i,
  /^career(s)?$/i,
  /^招聘$/i,
  /^活动预告$/i,
  /^直播预告$/i
];

const TECH_KEYWORDS = [
  'ai',
  'artificial intelligence',
  'model',
  'models',
  'llm',
  'gpt',
  'claude',
  'gemini',
  'reasoning',
  'agent',
  'agents',
  'coding',
  'developer',
  'developers',
  'api',
  'inference',
  'training',
  'benchmark',
  'safety',
  'robot',
  'robotics',
  'vision',
  'multimodal',
  'transformer',
  'genome',
  'language model',
  'tool use',
  '开源',
  '模型',
  '推理',
  '训练',
  '安全',
  '智能体',
  '机器人',
  '多模态',
  '开发者'
];

class TechNewsFetcher {
  constructor() {
    this.http = axios.create({
      timeout: 20000,
      headers: COMMON_HEADERS
    });
    this.lookbackHours = Math.max(SOURCE_LIMITS.lookbackHours, 24);
    this.fallbackLookbackDays = Math.max(SOURCE_LIMITS.fallbackLookbackDays, 7);
    this.maxTotalItems = Math.max(SOURCE_LIMITS.maxTotalItems, 6);
    this.minPreferredItems = Math.max(SOURCE_LIMITS.minPreferredItems, 4);
  }

  async fetchAllNews() {
    console.log('🔍 开始从高价值 AI 官方/研究来源获取资讯...');

    const settled = await Promise.allSettled(
      AI_NEWS_SOURCES.map(source => this.fetchSource(source))
    );

    const collected = [];

    settled.forEach((result, index) => {
      const source = AI_NEWS_SOURCES[index];
      if (result.status === 'fulfilled') {
        console.log(`✅ ${source.name}: 获取到 ${result.value.length} 条候选内容`);
        collected.push(...result.value);
      } else {
        console.error(`❌ ${source.name} 获取失败:`, result.reason?.message || result.reason);
      }
    });

    const curated = this.curateNews(collected);
    console.log(`📊 最终筛选出 ${curated.length} 条高质量 AI 资讯`);
    return curated;
  }

  async fetchSource(source) {
    switch (source.type) {
      case 'rss':
        return this.fetchRssSource(source);
      case 'anthropic-newsroom':
        return this.fetchAnthropicNewsroom(source);
      case 'deepmind-blog':
        return this.fetchDeepMindBlog(source);
      default:
        return [];
    }
  }

  async fetchRssSource(source) {
    const response = await this.http.get(source.url);
    const $ = cheerio.load(response.data, { xmlMode: true });
    const entries = $('item').length ? $('item').toArray() : $('entry').toArray();

    return entries
      .map(node => this.parseFeedEntry($(node), source))
      .filter(Boolean)
      .slice(0, source.maxItems * 3);
  }

  parseFeedEntry($entry, source) {
    const isRss = $entry[0].tagName === 'item';
    const rawTitle = isRss
      ? $entry.find('title').first().text()
      : $entry.find('title').first().text();
    const rawLink = isRss
      ? $entry.find('link').first().text()
      : ($entry.find('link').first().attr('href') || $entry.find('id').first().text());
    const rawSummary = isRss
      ? ($entry.find('description').first().text() || $entry.find('content\\:encoded').first().text())
      : ($entry.find('summary').first().text() || $entry.find('content').first().text());
    const rawDate = isRss
      ? ($entry.find('pubDate').first().text() || $entry.find('dc\\:date').first().text())
      : ($entry.find('published').first().text() || $entry.find('updated').first().text());

    const tags = isRss
      ? $entry.find('category').toArray().map(node => decodeHtmlEntities(cheerio.load(node, { xmlMode: true }).text().trim())).filter(Boolean)
      : $entry.find('category').toArray().map(node => decodeHtmlEntities(node.attribs?.term || '').trim()).filter(Boolean);

    const item = this.buildNewsItem({
      source,
      title: rawTitle,
      link: rawLink,
      summary: rawSummary,
      time: rawDate,
      rawCategory: tags[0],
      tags
    });

    if (!item) {
      return null;
    }

    if (!this.isRelevantForSource(source, item)) {
      return null;
    }

    return item;
  }

  async fetchAnthropicNewsroom(source) {
    const response = await this.http.get(source.url);
    const $ = cheerio.load(response.data);
    const detailLinks = this.extractDetailLinks($, '/news/', source.maxItems * 3);

    const settled = await Promise.allSettled(
      detailLinks.slice(0, source.maxItems * 2).map(link => this.fetchMetadataArticle(source, link))
    );

    return settled
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value)
      .filter(item => this.isRelevantForSource(source, item));
  }

  async fetchDeepMindBlog(source) {
    const response = await this.http.get(source.url);
    const $ = cheerio.load(response.data);
    const detailLinks = this.extractDetailLinks($, '/blog/', source.maxItems * 4);

    const settled = await Promise.allSettled(
      detailLinks.slice(0, source.maxItems * 2).map(link => this.fetchMetadataArticle(source, link))
    );

    return settled
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value)
      .filter(item => this.isRelevantForSource(source, item));
  }

  extractDetailLinks($, prefix, limit) {
    const links = [];
    const seen = new Set();

    $(`a[href^="${prefix}"]`).each((_, element) => {
      const href = $(element).attr('href');
      if (!href) {
        return;
      }

      const normalized = href.endsWith('/') ? href : `${href}/`;
      if (seen.has(normalized)) {
        return;
      }

      if (normalized === prefix || normalized.split('/').length <= 3) {
        return;
      }

      seen.add(normalized);
      links.push(normalized);

      if (links.length >= limit) {
        return false;
      }
    });

    return links;
  }

  async fetchMetadataArticle(source, relativeLink) {
    const absoluteUrl = relativeLink.startsWith('http')
      ? relativeLink
      : new URL(relativeLink, source.homepage).toString();
    const response = await this.http.get(absoluteUrl);
    const $ = cheerio.load(response.data);

    const title = $('meta[property="og:title"]').attr('content')
      || $('meta[name="twitter:title"]').attr('content')
      || $('title').first().text();
    const summary = $('meta[name="description"]').attr('content')
      || $('meta[property="og:description"]').attr('content')
      || '';
    const publishedAt = $('meta[property="article:published_time"]').attr('content')
      || $('meta[property="article:modified_time"]').attr('content')
      || $('time').first().attr('datetime')
      || '';
    const section = $('meta[property="article:section"]').attr('content') || source.defaultCategory;

    return this.buildNewsItem({
      source,
      title,
      link: absoluteUrl,
      summary,
      time: publishedAt,
      rawCategory: section,
      tags: section ? [section] : []
    });
  }

  buildNewsItem({ source, title, link, summary, time, rawCategory, tags = [] }) {
    const cleanTitle = this.cleanText(title);
    const cleanLink = this.normalizeLink(link);
    const cleanSummary = this.cleanSummary(summary, cleanTitle);

    if (!cleanTitle || !cleanLink || !this.isHighQualityTitle(cleanTitle)) {
      return null;
    }

    const parsedTime = this.parseTime(time);

    return {
      title: cleanTitle,
      link: cleanLink,
      summary: cleanSummary,
      source: source.name,
      sourceId: source.id,
      category: this.mapCategory(source, rawCategory),
      time: parsedTime,
      publishedAt: parsedTime,
      tags,
      priority: source.priority,
      homepage: source.homepage
    };
  }

  curateNews(items) {
    const deduped = [];
    const seen = new Set();

    items.forEach(item => {
      const dedupeKey = `${this.normalizeForComparison(item.title)}::${this.normalizeForComparison(item.link)}`;
      if (seen.has(dedupeKey)) {
        return;
      }

      seen.add(dedupeKey);
      deduped.push(item);
    });

    const preferredWindow = deduped.filter(item => this.isWithinHours(item.publishedAt, this.lookbackHours));
    const fallbackWindow = deduped.filter(item => this.isWithinDays(item.publishedAt, this.fallbackLookbackDays));
    const pool = preferredWindow.length >= this.minPreferredItems ? preferredWindow : fallbackWindow;

    const sorted = pool.sort((a, b) => this.scoreItem(b) - this.scoreItem(a));

    const selected = [];
    const perSource = new Map();

    sorted.forEach(item => {
      const source = AI_NEWS_SOURCES.find(candidate => candidate.id === item.sourceId);
      const currentCount = perSource.get(item.sourceId) || 0;
      const sourceLimit = source?.maxItems || 3;

      if (currentCount >= sourceLimit) {
        return;
      }

      if (selected.length >= this.maxTotalItems) {
        return;
      }

      perSource.set(item.sourceId, currentCount + 1);
      selected.push(item);
    });

    return selected;
  }

  scoreItem(item) {
    const ageHours = Math.max(moment().diff(item.publishedAt, 'hours', true), 0);
    const freshness = Math.max(0, 240 - ageHours);
    return item.priority * 1000 + freshness;
  }

  isRelevantForSource(source, item) {
    const haystack = `${item.title} ${item.summary} ${(item.tags || []).join(' ')}`.toLowerCase();

    if (source.id === 'openai') {
      const blockedCategories = new Set(['B2B Story', 'Global Affairs']);
      if (blockedCategories.has(item.tags?.[0])) {
        return false;
      }

      if (item.tags?.[0] === 'Company') {
        return this.containsTechKeyword(haystack);
      }

      return true;
    }

    if (source.id === 'anthropic') {
      const blockedPhrases = [
        'partner network',
        'office in',
        'office ',
        'institute',
        'statement',
        'department',
        'asia-pacific'
      ];

      if (blockedPhrases.some(phrase => haystack.includes(phrase))) {
        return false;
      }

      const anthropicSignals = [
        'claude',
        'model',
        'models',
        'reasoning',
        'coding',
        'computer use',
        'safety',
        'distillation',
        'scaling policy',
        'api'
      ];

      return anthropicSignals.some(signal => haystack.includes(signal));
    }

    if (source.id === 'deepmind') {
      return this.containsTechKeyword(haystack) || (item.tags || []).includes('Science');
    }

    if (source.id === 'nvidia-ai') {
      return this.containsTechKeyword(haystack)
        || (item.tags || []).map(tag => tag.toLowerCase()).includes('deep learning');
    }

    return true;
  }

  containsTechKeyword(text) {
    return TECH_KEYWORDS.some(keyword => text.includes(keyword));
  }

  mapCategory(source, rawCategory) {
    if (source.id === 'openai') {
      if (rawCategory === 'Research' || rawCategory === 'Safety') {
        return '研究与安全';
      }

      return '模型与产品';
    }

    if (source.id === 'anthropic') {
      return '模型与安全';
    }

    if (source.id === 'deepmind' || source.id === 'apple-ml') {
      return '研究进展';
    }

    if (source.id === 'nvidia-ai') {
      return '工程实践';
    }

    return source.defaultCategory;
  }

  parseTime(input) {
    if (!input) {
      return moment();
    }

    const parsed = moment(new Date(input));
    if (parsed.isValid()) {
      return parsed;
    }

    const fallback = moment(input, [
      'ddd, DD MMM YYYY HH:mm:ss ZZ',
      'YYYY-MM-DDTHH:mm:ssZ',
      'YYYY-MM-DD HH:mm:ss',
      'YYYY-MM-DD'
    ], true);

    return fallback.isValid() ? fallback : moment();
  }

  isWithinHours(time, hours) {
    const diff = moment().diff(time, 'hours', true);
    return diff >= 0 && diff <= hours;
  }

  isWithinDays(time, days) {
    const diff = moment().diff(time, 'days', true);
    return diff >= 0 && diff <= days;
  }

  formatNewsDigest(news) {
    const subject = `AI 技术情报 - ${moment().format('YYYY/MM/DD')}`;
    const usesFallbackWindow = news.some(item => !this.isWithinHours(item.publishedAt, this.lookbackHours));
    const intro = usesFallbackWindow
      ? `优先显示过去 ${this.lookbackHours} 小时内更新；当高质量内容不足时，补充近 ${this.fallbackLookbackDays} 天内值得关注的官方/研究动态。`
      : `过去 ${this.lookbackHours} 小时内，从 OpenAI、Anthropic、Google DeepMind、Apple ML、NVIDIA 等高信噪比来源筛选。`;

    if (!news.length) {
      return {
        subject,
        html: `
          <h1>AI 技术情报</h1>
          <p>过去 ${this.lookbackHours} 小时内没有筛选到符合标准的高质量更新。</p>
          <p>当前仅保留官方/研究团队来源，并自动过滤低价值页面与泛社区噪音。</p>
        `,
        text: `AI 技术情报\n\n过去 ${this.lookbackHours} 小时内没有筛选到符合标准的高质量更新。\n当前仅保留官方/研究团队来源，并自动过滤低价值页面与泛社区噪音。`,
        markdown: `# AI 技术情报\n\n过去 ${this.lookbackHours} 小时内没有筛选到符合标准的高质量更新。\n\n当前仅保留官方/研究团队来源，并自动过滤低价值页面与泛社区噪音。`
      };
    }

    const grouped = this.groupByCategory(news);
    const sections = ['模型与产品', '模型与安全', '研究进展', '工程实践']
      .filter(category => grouped[category]?.length);

    let html = `<h1>AI 技术情报</h1>`;
    html += `<p style="color:#555;font-size:14px;margin:0 0 20px;">${intro}</p>`;

    let text = `AI 技术情报\n${intro}\n`;
    let markdown = `# AI 技术情报\n\n${intro}\n`;

    sections.forEach(category => {
      html += `<h2 style="margin:28px 0 14px;color:#222;border-bottom:1px solid #eee;padding-bottom:8px;">${category}</h2>`;
      text += `\n【${category}】\n`;
      markdown += `\n## ${category}\n`;

      grouped[category].forEach((item, index) => {
        const timeLabel = item.publishedAt.format('MM-DD HH:mm');
        const displayTitle = item.translatedTitle || item.title;
        const displaySummary = item.translatedSummary || item.summary;
        const summary = displaySummary ? this.escapeHtml(displaySummary) : '';
        const summaryLabel = item.translatedSummary ? '中文摘要' : '摘要';
        const originalTitle = item.translatedTitle && item.originalTitle
          ? this.escapeHtml(item.originalTitle)
          : '';

        html += `
          <div style="margin-bottom:18px;padding:16px;border:1px solid #ececec;border-radius:10px;background:#fafafa;">
            <div style="font-size:18px;font-weight:700;color:#111;line-height:1.5;">${index + 1}. ${this.escapeHtml(displayTitle)}</div>
            <div style="margin-top:8px;color:#666;font-size:13px;">${item.source} ｜ ${item.category} ｜ ${timeLabel}</div>
            ${originalTitle ? `<p style="margin:8px 0 0;color:#777;font-size:13px;line-height:1.6;">原文标题：${originalTitle}</p>` : ''}
            ${summary ? `<p style="margin:10px 0 0;color:#333;line-height:1.7;">${summary}</p>` : ''}
            <p style="margin:12px 0 0;"><a href="${item.link}" style="color:#d9485f;text-decoration:none;font-weight:600;">查看原文</a></p>
          </div>
        `;

        text += `${index + 1}. ${displayTitle}\n`;
        if (item.translatedTitle && item.originalTitle) {
          text += `   原文标题: ${item.originalTitle}\n`;
        }
        text += `   ${item.source} | ${item.category} | ${timeLabel}\n`;
        if (displaySummary) {
          text += `   ${displaySummary}\n`;
        }
        text += `   原文链接: ${item.link}\n`;

        markdown += `${index + 1}. **${displayTitle}**\n`;
        if (item.translatedTitle && item.originalTitle) {
          markdown += `   - 原文标题：${item.originalTitle}\n`;
        }
        markdown += `   - 来源：${item.source} | 分类：${item.category} | 时间：${timeLabel}\n`;
        if (displaySummary) {
          markdown += `   - ${summaryLabel}：${displaySummary}\n`;
        }
        markdown += `   - 原文链接：${item.link}\n`;
      });
    });

    html += `<hr style="border:none;border-top:1px solid #e6e6e6;margin:28px 0;" />`;
    html += `<p style="color:#888;font-size:12px;line-height:1.8;">更新时间：${moment().format('YYYY年MM月DD日 HH:mm')}<br/>筛选规则：优先官方/研究团队来源，自动过滤低质量标题、非技术向动态和重复内容。</p>`;

    text += `\n更新时间：${moment().format('YYYY年MM月DD日 HH:mm')}\n筛选规则：优先官方/研究团队来源，自动过滤低质量标题、非技术向动态和重复内容。`;
    markdown += `\n更新时间：${moment().format('YYYY年MM月DD日 HH:mm')}\n\n筛选规则：优先官方/研究团队来源，自动过滤低质量标题、非技术向动态和重复内容。`;

    return { subject, html, text, markdown };
  }

  formatNewsMessage(news) {
    return this.formatNewsDigest(news).html;
  }

  groupByCategory(news) {
    return news.reduce((acc, item) => {
      const key = item.category || '其他';
      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(item);
      return acc;
    }, {});
  }

  cleanText(text) {
    return decodeHtmlEntities(String(text || ''))
      .replace(/\s+/g, ' ')
      .replace(/[|｜]\s*(OpenAI|Anthropic|Google DeepMind|NVIDIA Blog|Apple Machine Learning Research)$/i, '')
      .trim();
  }

  cleanSummary(summary, title) {
    const text = stripHtml(String(summary || ''))
      .replace(/\s+/g, ' ')
      .trim();

    if (!text || text === title) {
      return '';
    }

    return this.truncateText(text, 180);
  }

  truncateText(text, limit) {
    if (text.length <= limit) {
      return text;
    }

    return `${text.slice(0, limit - 1).trim()}…`;
  }

  normalizeLink(link) {
    const cleanLink = String(link || '').trim();
    if (!cleanLink) {
      return '';
    }

    try {
      const parsed = new URL(cleanLink);
      parsed.hash = '';
      return parsed.toString();
    } catch (error) {
      return cleanLink;
    }
  }

  normalizeForComparison(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .replace(/[^\p{L}\p{N}]+/gu, '');
  }

  isHighQualityTitle(title) {
    const cleanTitle = title.trim();
    if (cleanTitle.length < 8) {
      return false;
    }

    return !BAD_TITLE_PATTERNS.some(pattern => pattern.test(cleanTitle));
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };

    return String(text).replace(/[&<>"']/g, char => map[char]);
  }
}

module.exports = TechNewsFetcher;
