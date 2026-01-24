# Tech News Action

🤖 自动获取科技资讯并推送至微信的 GitHub Actions 工作流

## 功能特性

- ⏰ **定时执行**: 每天早上8点自动运行
- 📰 **多源获取**: 支持36氪、虎嗅、IT之家等科技媒体
- 🕒 **时效过滤**: 只获取过去24小时内的最新资讯
- 📱 **微信推送**: 支持企业微信机器人和应用推送
- 📊 **日志记录**: 完整的执行日志和错误追踪
- 🔄 **容错机制**: 推送失败时自动尝试备用方案

## 快速开始

### 1. Fork 本仓库

点击右上角的 Fork 按钮将仓库复制到你的 GitHub 账户。

### 2. 配置微信推送

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加以下密钥：

#### 方式一：企业微信机器人（推荐）

```
WECHAT_WEBHOOK=你的企业微信机器人Webhook URL
```

#### 方式二：企业微信应用

```
WECHAT_APP_ID=你的企业微信应用ID
WECHAT_APP_SECRET=你的企业微信应用Secret
WECHAT_AGENT_ID=你的企业微信应用ID（可选，默认1000001）
```

### 3. 启用 GitHub Actions

1. 进入仓库的 Actions 页面
2. 点击 "I understand my workflows, go ahead and enable them"
3. 工作流将在每天早上8点（北京时间）自动运行

### 4. 手动测试

可以在 Actions 页面手动触发工作流进行测试：

1. 进入 Actions 页面
2. 选择 "Daily Tech News Push" 工作流
3. 点击 "Run workflow"

## 配置说明

### 时间设置

工作流默认设置为每天早上8点（UTC时间0点），如需修改：

编辑 `.github/workflows/daily-tech-news.yml` 文件中的 cron 表达式：

```yaml
schedule:
  - cron: '0 0 * * *'  # UTC时间0点 = 北京时间8点
```

### 新闻源配置

当前支持以下新闻源：

- 36氪 (36kr.com)
- 虎嗅 (huxiu.com)  
- IT之家 (ithome.com)

可在 `src/newsFetcher.js` 中修改或添加新的新闻源。

### 推送配置

支持两种推送方式：

1. **企业微信机器人**: 简单快速，适合群聊推送
2. **企业微信应用**: 功能更丰富，支持指定用户推送

系统会优先使用机器人推送，失败时自动尝试应用推送。

## 项目结构

```
TechNewsAction/
├── .github/workflows/
│   └── daily-tech-news.yml    # GitHub Actions 工作流
├── src/
│   ├── index.js               # 主程序入口
│   ├── newsFetcher.js         # 新闻获取模块
│   └── weChatNotifier.js      # 微信推送模块
├── logs/                      # 日志文件目录
├── package.json               # 项目依赖
└── README.md                  # 项目说明
```

## 本地开发

### 安装依赖

```bash
npm install
```

### 本地运行

```bash
# 设置环境变量
export WECHAT_WEBHOOK="your_webhook_url"

# 运行程序
npm start
```

### 查看日志

```bash
tail -f logs/tech-news-$(date +%Y-%m-%d).log
```

## 故障排除

### 1. 微信推送失败

- 检查 Webhook URL 是否正确
- 确认企业微信机器人是否在群中
- 验证应用ID和Secret是否有效

### 2. 新闻获取失败

- 检查网络连接
- 确认新闻源网站是否可访问
- 查看日志文件了解具体错误

### 3. 工作流不执行

- 确认 GitHub Actions 已启用
- 检查 cron 表达式是否正确
- 查看 Actions 页面的错误信息

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 许可证

MIT License

## 更新日志

### v1.0.0
- 初始版本发布
- 支持多源新闻获取
- 实现微信推送功能
- 添加定时任务配置