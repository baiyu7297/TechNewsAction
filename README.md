# Tech News Action

🤖 自动获取科技资讯并推送至微信的 GitHub Actions 工作流

## 功能特性

- ⏰ **定时执行**: 每天早上8点自动运行
- 📰 **多源获取**: 支持36氪、虎嗅、IT之家等科技媒体
- 🕒 **时效过滤**: 只获取过去24小时内的最新资讯
- 📱 **多种推送**: 支持企业微信、Server酱、钉钉、邮件等多种推送方式
- 📊 **日志记录**: 完整的执行日志和错误追踪
- 🔄 **容错机制**: 推送失败时自动尝试备用方案

## 环境要求

- Node.js >= 20.0.0
- GitHub Actions 环境

## 快速开始

### 1. Fork 本仓库

点击右上角的 Fork 按钮将仓库复制到你的 GitHub 账户。

### 2. 配置推送方式

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加以下密钥（至少配置一种）：

#### 方式一：Server酱（推荐，最简单）

```
SERVER_CHAN_KEY=你的Server酱SendKey
```

获取方式：访问 [sct.ftqq.com](https://sct.ftqq.com) 注册并获取 SendKey

#### 方式二：企业微信机器人

```
WECHAT_WEBHOOK=你的企业微信机器人Webhook URL
```

#### 方式三：钉钉机器人

```
DINGTALK_WEBHOOK=你的钉钉机器人Webhook URL
```

#### 方式四：邮件推送

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_password
TO_EMAIL=recipient@example.com
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

支持多种推送方式（优先级从高到低）：

1. **Server酱**: 最简单，支持微信推送
2. **企业微信**: 适合企业团队使用
3. **钉钉**: 适合使用钉钉的团队
4. **邮件**: 通用方案，支持任何邮箱

系统会按优先级自动选择已配置的推送方式。

## 项目结构

```
TechNewsAction/
├── .github/workflows/
│   └── daily-tech-news.yml    # GitHub Actions 工作流
├── src/
│   ├── index.js               # 主程序入口
│   ├── newsFetcher.js         # 新闻获取模块
│   ├── weChatNotifier.js      # 企业微信推送
│   ├── serverChanNotifier.js  # Server酱推送
│   ├── dingTalkNotifier.js    # 钉钉推送
│   ├── emailNotifier.js       # 邮件推送
│   └── healthCheck.js         # 健康检查脚本
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
# 设置环境变量（选择一种推送方式）
export SERVER_CHAN_KEY="your_sendkey"
# 或
export WECHAT_WEBHOOK="your_webhook_url"

# 运行健康检查
npm run health

# 运行程序
npm start
```

### 查看日志

```bash
tail -f logs/tech-news-$(date +%Y-%m-%d).log
```

## 故障排除

### 1. 推送失败

- 检查对应推送方式的配置是否正确
- 确认 Webhook URL 或 API Key 是否有效
- 查看日志文件了解具体错误信息

### 2. Node.js 版本错误

确保使用 Node.js 20 或更高版本：
```bash
node --version  # 应该显示 v20.x.x 或更高
```

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