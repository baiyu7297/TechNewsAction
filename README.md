# AI Tech News Action

🤖 自动获取中文 AI 技术资讯并推送至邮箱的 GitHub Actions 工作流

## 功能特性

- ⏰ **定时执行**: 每天早上8点自动运行
- 🤖 **AI 专注**: 专注于人工智能领域的中文资讯
- 📰 **多源获取**: 支持机器之心、量子位、雷峰网AI等优质媒体
- 📱 **邮件推送**: 支持 QQ/163/126/Gmail 等多种邮箱
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

#### 方式四：邮件推送（推荐 QQ 邮箱）

**方案 A：QQ 邮箱（最简单，5分钟配置）**

1. 登录 QQ 邮箱：https://mail.qq.com/
2. 设置 → 账户 → 开启 "IMAP/SMTP服务"
3. 发送短信验证，获取 16 位授权码
4. 在 GitHub Secrets 中添加：

```
SMTP_USER=你的QQ邮箱（例如：123456789@qq.com）
SMTP_PASS=16位授权码（不是QQ密码！）
TO_EMAIL=接收邮件的邮箱地址
```

详细步骤请查看：[QQ_EMAIL_SETUP.md](QQ_EMAIL_SETUP.md)

**方案 B：163/126 邮箱（同样简单）**

配置方法与 QQ 邮箱相同，代码会自动识别邮箱类型。

**方案 C：其他邮箱服务**

如果无法使用国内邮箱，查看：[ALTERNATIVE_EMAIL_SOLUTIONS.md](ALTERNATIVE_EMAIL_SOLUTIONS.md)

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

当前支持以下中文 AI 技术新闻源：

- **机器之心** - 专业的人工智能媒体和产业服务平台
- **量子位** - 关注人工智能及前沿科技
- **雷峰网AI** - AI 科技评论，深度报道人工智能

这些都是国内优质的 AI 技术媒体，提供专业、及时的人工智能资讯。

### 邮箱配置

**支持的邮箱类型：**
- QQ 邮箱（推荐，国内最简单）
- 163 邮箱
- 126 邮箱
- Gmail（需要翻墙）
- Outlook/Hotmail

代码会自动识别邮箱类型并使用正确的 SMTP 配置。

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
# 设置环境变量（QQ 邮箱示例）
export SMTP_USER="123456789@qq.com"
export SMTP_PASS="你的16位授权码"
export TO_EMAIL="recipient@example.com"

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

### 1. QQ 邮箱发送问题

**错误：Invalid login: 535 Login Fail**
- 原因：使用了 QQ 密码而不是授权码
- 解决：使用 QQ 邮箱设置中生成的 16 位授权码

**错误：Mail send frequency exceeds limit**
- 原因：发送频率过高
- 解决：不要频繁测试，每天运行一次即可

**详细配置步骤：** 查看 [QQ_EMAIL_SETUP.md](QQ_EMAIL_SETUP.md)

### 2. 未收到邮件

检查清单：
- ✅ 检查垃圾邮件文件夹
- ✅ 确认 TO_EMAIL 地址正确
- ✅ 确认使用的是授权码，不是邮箱密码
- ✅ 查看 GitHub Actions 日志

### 3. 获取不到新闻

- 机器之心、量子位、雷峰网都是国内网站
- 确保 GitHub Actions 运行环境可以访问这些网站
- 查看日志了解具体哪个源失败了
- 网站结构可能变化，导致选择器失效

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