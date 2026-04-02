const axios = require('axios');

function chunk(array, size) {
  const result = [];
  for (let index = 0; index < array.length; index += size) {
    result.push(array.slice(index, index + size));
  }
  return result;
}

class NewsTranslator {
  constructor() {
    this.enabled = !['0', 'false', 'off'].includes(String(process.env.TRANSLATE_TO_ZH || 'true').toLowerCase());
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL || 'gpt-5-mini';
    this.baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
    this.batchSize = Math.max(parseInt(process.env.TRANSLATION_BATCH_SIZE || '5', 10), 1);
    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey || ''}`
      }
    });
  }

  async translateNews(news) {
    if (!this.enabled || !Array.isArray(news) || news.length === 0) {
      return news;
    }

    if (!this.apiKey) {
      console.warn('⚠️ 未配置 OPENAI_API_KEY，跳过中文翻译，保留原文标题和摘要。');
      return news;
    }

    const candidates = news
      .map((item, index) => ({
        id: String(index),
        index,
        title: item.title,
        summary: item.summary || ''
      }))
      .filter(item => this.needsTranslation(item.title) || this.needsTranslation(item.summary));

    if (!candidates.length) {
      return news;
    }

    console.log(`🌏 开始将 ${candidates.length} 条资讯翻译为中文...`);

    const translatedMap = new Map();

    for (const batch of chunk(candidates, this.batchSize)) {
      try {
        const translatedItems = await this.translateBatch(batch);
        translatedItems.forEach(item => {
          translatedMap.set(item.id, item);
        });
      } catch (error) {
        console.warn(`⚠️ 一批资讯翻译失败，将保留原文内容: ${error.message}`);
      }
    }

    return news.map((item, index) => {
      const translated = translatedMap.get(String(index));
      if (!translated) {
        return item;
      }

      return {
        ...item,
        originalTitle: item.title,
        originalSummary: item.summary,
        translatedTitle: translated.titleZh || item.title,
        translatedSummary: translated.summaryZh || item.summary
      };
    });
  }

  async translateBatch(items) {
    const prompt = {
      items: items.map(item => ({
        id: item.id,
        title: item.title,
        summary: item.summary
      }))
    };

    const response = await this.http.post('/responses', {
      model: this.model,
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: [
                '你是一名面向中文技术用户的 AI 新闻翻译编辑。',
                '请把输入的新闻标题和摘要翻译为自然、准确、简洁的简体中文。',
                '保留模型名、产品名、API 名、公司名、论文名中的关键英文专有名词，例如 GPT-5、Claude、ChatGPT、API、AlphaGenome。',
                '不要编造信息，不要加评论，不要补充原文中没有的细节。',
                '标题适合邮件推送阅读，摘要保持 1-2 句中文。',
                '返回 JSON，字段必须完整。'
              ].join('\n')
            }
          ]
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: JSON.stringify(prompt, null, 2)
            }
          ]
        }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'translated_news_batch',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    id: { type: 'string' },
                    titleZh: { type: 'string' },
                    summaryZh: { type: 'string' }
                  },
                  required: ['id', 'titleZh', 'summaryZh']
                }
              }
            },
            required: ['items']
          }
        }
      }
    });

    const outputText = this.extractOutputText(response.data);
    const parsed = JSON.parse(outputText);
    return parsed.items || [];
  }

  extractOutputText(data) {
    if (typeof data?.output_text === 'string' && data.output_text.trim()) {
      return data.output_text;
    }

    const output = Array.isArray(data?.output) ? data.output : [];
    const textParts = [];

    output.forEach(item => {
      if (!Array.isArray(item.content)) {
        return;
      }

      item.content.forEach(content => {
        if (typeof content?.text === 'string') {
          textParts.push(content.text);
        } else if (typeof content?.text?.value === 'string') {
          textParts.push(content.text.value);
        }
      });
    });

    if (textParts.length) {
      return textParts.join('\n');
    }

    throw new Error('OpenAI 翻译接口未返回可解析文本');
  }

  needsTranslation(text = '') {
    if (!text || !text.trim()) {
      return false;
    }

    return !/[\u4e00-\u9fff]/.test(text);
  }
}

module.exports = NewsTranslator;
