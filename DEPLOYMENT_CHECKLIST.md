# 部署检查清单

## ✅ 代码已完成

- [x] 新闻获取功能（Hacker News, GitHub Trending, Dev.to）
- [x] 邮件发送功能（支持 Gmail + SendGrid 双方案）
- [x] 自动容错和备用方案
- [x] 详细的日志输出
- [x] 健康检查脚本

## 📋 GitHub Secrets 配置

### 最简单方案：SendGrid（推荐）

在 GitHub 仓库的 **Settings > Secrets and variables > Actions** 中添加：

```
名称: SMTP_USER
值: 你的邮箱地址（任意邮箱）

名称: TO_EMAIL
值: 接收邮件的地址

名称: SENDGRID_API_KEY
值: 你的 SendGrid API Key
```

**获取 SendGrid API Key：**
1. 访问 https://sendgrid.com/ 注册（免费）
2. 进入 Settings > API Keys
3. 点击 "Create API Key"
4. 选择 "Full Access" 或 "Mail Send"
5. 复制生成的 API Key（以 SG. 开头）

### 备选方案：Gmail

```
名称: SMTP_USER
值: 你的Gmail地址

名称: SMTP_PASS
值: Gmail应用专用密码（16位）

名称: TO_EMAIL
值: 接收邮件的地址
```

**获取 Gmail 应用专用密码：**
1. https://myaccount.google.com/security
2. 启用"两步验证"
3. 搜索"应用专用密码"
4. 生成密码（选择"邮件"）

## 🚀 部署步骤

1. **提交代码**
   ```bash
   git add .
   git commit -m "完成邮件推送功能"
   git push
   ```

2. **配置 Secrets**
   - 进入 GitHub 仓库
   - Settings > Secrets and variables > Actions
   - 添加上述 3 个 secrets

3. **测试运行**
   - 进入 Actions 页面
   - 选择 "Daily Tech News Push"
   - 点击 "Run workflow"
   - 等待执行完成

4. **检查结果**
   - 查看 Actions 日志
   - 检查邮箱（包括垃圾邮件文件夹）

## 🔍 故障排查

### 如果邮件发送失败

1. **检查日志**
   - 查看 GitHub Actions 的详细日志
   - 查找 "❌" 标记的错误信息

2. **验证 Secrets**
   - 确认所有 Secrets 都已正确添加
   - 注意不要有多余的空格

3. **SendGrid 问题**
   - 确认 API Key 有 "Mail Send" 权限
   - 检查 SendGrid 账户是否激活
   - 查看 SendGrid 控制台的发送记录

4. **Gmail 问题**
   - 确认使用的是应用专用密码，不是普通密码
   - 确认已启用两步验证
   - 如果失败，切换到 SendGrid

## 📊 预期结果

成功运行后，你应该：
- ✅ 收到一封包含科技资讯的邮件
- ✅ 邮件包含 Hacker News、GitHub Trending、Dev.to 的内容
- ✅ 邮件格式为 HTML，带有链接和样式
- ✅ GitHub Actions 显示绿色勾号

## 🎯 下一步

- 每天早上 8 点（北京时间）自动运行
- 可以随时手动触发
- 查看日志文件（Actions artifacts）
