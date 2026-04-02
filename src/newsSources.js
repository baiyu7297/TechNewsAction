const AI_NEWS_SOURCES = [
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'rss',
    url: 'https://openai.com/news/rss.xml',
    homepage: 'https://openai.com/news',
    defaultCategory: '模型与产品',
    priority: 100,
    maxItems: 4
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    type: 'anthropic-newsroom',
    url: 'https://www.anthropic.com/news',
    homepage: 'https://www.anthropic.com/news',
    defaultCategory: '模型与安全',
    priority: 96,
    maxItems: 3
  },
  {
    id: 'deepmind',
    name: 'Google DeepMind',
    type: 'deepmind-blog',
    url: 'https://deepmind.google/blog/',
    homepage: 'https://deepmind.google/blog/',
    defaultCategory: '研究进展',
    priority: 93,
    maxItems: 3
  },
  {
    id: 'apple-ml',
    name: 'Apple ML Research',
    type: 'rss',
    url: 'https://machinelearning.apple.com/rss.xml',
    homepage: 'https://machinelearning.apple.com/research',
    defaultCategory: '研究进展',
    priority: 88,
    maxItems: 3
  },
  {
    id: 'nvidia-ai',
    name: 'NVIDIA AI',
    type: 'rss',
    url: 'https://blogs.nvidia.com/blog/category/enterprise/deep-learning/feed/',
    homepage: 'https://blogs.nvidia.com/blog/category/enterprise/deep-learning/',
    defaultCategory: '工程实践',
    priority: 80,
    maxItems: 3
  }
];

const SOURCE_LIMITS = {
  lookbackHours: parseInt(process.env.NEWS_LOOKBACK_HOURS || '72', 10),
  fallbackLookbackDays: parseInt(process.env.NEWS_FALLBACK_DAYS || '14', 10),
  maxTotalItems: parseInt(process.env.NEWS_MAX_ITEMS || '12', 10),
  minPreferredItems: parseInt(process.env.NEWS_MIN_ITEMS || '6', 10)
};

module.exports = {
  AI_NEWS_SOURCES,
  SOURCE_LIMITS
};
