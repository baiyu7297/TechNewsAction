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

#### 方式四：邮件推送（Gmail）

**重要：Gmail 需要使用应用专用密码，不能使用普通密码！**

1. 登录你的 Gmail 账户
2. 访问 [Google 账户安全设置](https://myaccount.google.com/security)
3. 启用"两步验证"（如果还没启用）
4. 在"两步验证"页面，找到"应用专用密码"
5. 生成一个新的应用专用密码（选择"邮件"和"其他设备"）
6. 复制生成的 16 位密码

然后在 GitHub Secrets 中添加：

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=你的Gmail地址（例如：yourname@gmail.com）
SMTP_PASS=刚才生成的16位应用专用密码（不是你的Gmail密码！）
TO_EMAIL=接收邮件的地址（可以是同一个Gmail地址）
```

**常见问题：**
- ❌ 使用普通密码会失败
- ✅ 必须使用应用专用密码
- ✅ 必须启用两步验证才能生成应用专用密码

### 3. 启用 GitHub Actions

1. 进入仓库的 Actions 页面
2. 点击 "I understand my workflows, go ahead and enable them"
3. 工作流将在每天早上8点（北京时间）自动运行

### 4. 手动测试

#### 在 GitHub Actions 中测试

可以在 Actions 页面手动触发工作流进行测试：

1. 进入 Actions 页面
2. 选择 "Daily Tech News Push" 工作流
3. 点击 "Run workflow"
4. 等待执行完成，检查日志和邮箱

#### 本地测试邮件配置

如果你想在本地测试邮件发送：

```bash
# 设置环境变量
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USER=your_email@gmail.com
export SMTP_PASS=your_app_password
export TO_EMAIL=recipient@example.com

# 运行邮件测试
npm run test:email
```

## 配置说明

### 时间设置

工作流默认设置为每天早上8点（UTC时间0点），如需修改：

编辑 `.github/workflows/daily-tech-news.yml` 文件中的 cron 表达式：

```yaml
schedule:
  - cron: '0 0 * * *'  # UTC时间0点 = 北京时间8点
```

### 新闻源配置

当前支持以下国际科技新闻源：

- **Hacker News** - 最热门的科技新闻和讨论
- **GitHub Trending** - 当日最热门的开源项目
- **Dev.to** - 开发者社区的热门文章

这些新闻源都提供稳定的 API 或易于抓取的页面结构，确保可靠性。

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

### 1. Gmail 邮件发送失败

**错误：Invalid login 或 Username and Password not accepted**

原因：使用了普通密码而不是应用专用密码

解决方法：
1. 访问 [Google 账户安全设置](https://myaccount.google.com/security)
2. 启用"两步验证"
3. 生成"应用专用密码"
4. 使用应用专用密码替换 SMTP_PASS

**错误：Connection timeout**

原因：SMTP 端口被防火墙阻止

解决方法：
- 尝试使用端口 465（需要设置 SMTP_PORT=465）
- 或使用端口 587（推荐）

### 2. 未收到邮件

检查清单：
- ✅ 检查垃圾邮件文件夹
- ✅ 确认 TO_EMAIL 地址正确
- ✅ 查看 GitHub Actions 日志中的错误信息
- ✅ 运行 `npm run test:email` 本地测试

### 3. 获取不到新闻

- Hacker News、GitHub Trending、Dev.to 都是国际网站
- 确保 GitHub Actions 运行环境可以访问这些网站
- 查看日志了解具体哪个源失败了

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