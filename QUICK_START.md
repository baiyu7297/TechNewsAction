# 🚀 快速启动指南

## 5 分钟完成配置（使用 QQ 邮箱）

### 步骤 1: Fork 仓库
点击右上角的 "Fork" 按钮

### 步骤 2: 开启 QQ 邮箱 SMTP
1. 访问 https://mail.qq.com/ 登录
2. 点击 "设置" → "账户"
3. 找到 "IMAP/SMTP服务"，点击 "开启"
4. 发送短信验证（按提示操作）
5. **复制显示的 16 位授权码**（重要！）

### 步骤 3: 配置 GitHub Secrets
1. 进入你 Fork 的仓库
2. 点击 Settings > Secrets and variables > Actions
3. 点击 "New repository secret"
4. 添加以下 3 个 secrets：

**Secret 1:**
```
Name: SMTP_USER
Value: 你的QQ邮箱（例如：123456789@qq.com）
```

**Secret 2:**
```
Name: SMTP_PASS
Value: 刚才复制的16位授权码（不是QQ密码！）
```

**Secret 3:**
```
Name: TO_EMAIL
Value: 接收邮件的邮箱地址（可以是同一个QQ邮箱）
```

### 步骤 4: 启用 GitHub Actions
1. 进入 Actions 页面
2. 如果看到提示，点击 "I understand my workflows, go ahead and enable them"

### 步骤 5: 测试运行
1. 在 Actions 页面
2. 选择 "Daily Tech News Push"
3. 点击 "Run workflow"
4. 点击绿色的 "Run workflow" 按钮
5. 等待 1-2 分钟

### 步骤 6: 检查邮件
- 查看你的邮箱（TO_EMAIL 配置的地址）
- 如果没有，检查垃圾邮件文件夹
- 应该会收到一封包含科技资讯的邮件

## ✅ 完成！

现在每天早上 8 点（北京时间）会自动发送科技资讯到你的邮箱。

## 🔧 故障排查

### 没收到邮件？

1. **检查 Actions 日志**
   - 进入 Actions 页面
   - 点击最新的运行记录
   - 查看 "Fetch tech news and push" 步骤的日志
   - 查找错误信息

2. **常见问题**
   - ❌ 使用了 QQ 密码：必须使用授权码
   - ❌ 授权码错误：重新生成授权码
   - ❌ SMTP 未开启：确认已开启 IMAP/SMTP 服务

3. **详细配置指南**
   查看：[QQ_EMAIL_SETUP.md](QQ_EMAIL_SETUP.md)

## 📧 需要帮助？

查看完整文档：
- [README.md](README.md) - 完整功能说明
- [QQ_EMAIL_SETUP.md](QQ_EMAIL_SETUP.md) - QQ 邮箱详细配置
- [ALTERNATIVE_EMAIL_SOLUTIONS.md](ALTERNATIVE_EMAIL_SOLUTIONS.md) - 其他邮箱方案

## 🎯 下一步

- 修改定时时间：编辑 `.github/workflows/daily-tech-news.yml` 中的 cron 表达式
- 添加更多新闻源：编辑 `src/newsFetcher.js`
- 自定义邮件格式：编辑 `src/newsFetcher.js` 中的 `formatNewsMessage` 方法
