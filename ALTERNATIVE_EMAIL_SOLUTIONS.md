# 替代邮件发送方案

SendGrid 无法访问？这里有多个替代方案，选择一个最适合你的。

## 🎯 方案对比

| 方案 | 难度 | 免费额度 | 是否需要翻墙 | 推荐度 |
|------|------|----------|--------------|--------|
| Resend | ⭐ 最简单 | 3000封/月 | ❌ 不需要 | ⭐⭐⭐⭐⭐ |
| Mailgun | ⭐⭐ 简单 | 5000封/月 | ❌ 不需要 | ⭐⭐⭐⭐ |
| QQ邮箱 SMTP | ⭐⭐ 简单 | 无限制 | ❌ 不需要 | ⭐⭐⭐⭐ |
| 163邮箱 SMTP | ⭐⭐ 简单 | 无限制 | ❌ 不需要 | ⭐⭐⭐⭐ |
| Gmail SMTP | ⭐⭐⭐ 复杂 | 无限制 | ✅ 需要 | ⭐⭐⭐ |

---

## 🚀 方案 1：Resend（最推荐）

### 优势
- ✅ 国内可以访问
- ✅ 注册最简单
- ✅ 免费额度：每月 3000 封
- ✅ 界面友好，专为开发者设计

### 注册步骤

1. **访问 Resend**
   ```
   https://resend.com/
   ```

2. **注册账户**
   - 点击 "Sign Up"
   - 使用 GitHub 账号登录（最快）
   - 或使用邮箱注册

3. **创建 API Key**
   - 登录后自动进入控制台
   - 点击 "API Keys"
   - 点击 "Create API Key"
   - 名称填写：`TechNewsAction`
   - 权限选择：`Sending access`
   - 点击 "Create"
   - **复制 API Key**（以 `re_` 开头）

4. **验证域名（可选）**
   - 如果没有域名，可以跳过
   - Resend 允许使用 `onboarding@resend.dev` 作为发件人

### 配置 GitHub Secrets

```
Name: RESEND_API_KEY
Value: 你的 Resend API Key（re_ 开头）

Name: SMTP_USER
Value: onboarding@resend.dev

Name: TO_EMAIL
Value: 你的接收邮箱
```

### 修改代码

需要更新 `src/simpleEmailNotifier.js`，我会帮你修改。

---

## 🚀 方案 2：QQ 邮箱 SMTP（国内最简单）

### 优势
- ✅ 完全免费
- ✅ 国内服务，速度快
- ✅ 无需翻墙
- ✅ 配置简单

### 配置步骤

1. **登录 QQ 邮箱**
   访问：https://mail.qq.com/

2. **开启 SMTP 服务**
   - 点击顶部的 "设置"
   - 点击 "账户"
   - 找到 "POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
   - 找到 "SMTP服务"，点击 "开启"
   - 按照提示发送短信验证
   - **记录生成的授权码**（16位字符）

3. **配置 GitHub Secrets**

```
Name: SMTP_USER
Value: 你的QQ邮箱（例如：123456789@qq.com）

Name: SMTP_PASS
Value: 刚才生成的授权码（16位）

Name: TO_EMAIL
Value: 接收邮件的邮箱地址
```

4. **修改代码**

需要更新 SMTP 配置，我会帮你修改。

---

## 🚀 方案 3：163 邮箱 SMTP

### 优势
- ✅ 完全免费
- ✅ 国内服务
- ✅ 稳定可靠

### 配置步骤

1. **登录 163 邮箱**
   访问：https://mail.163.com/

2. **开启 SMTP 服务**
   - 点击顶部的 "设置"
   - 点击 "POP3/SMTP/IMAP"
   - 找到 "SMTP服务"
   - 点击 "开启"
   - 按照提示设置授权密码
   - **记录授权密码**

3. **配置 GitHub Secrets**

```
Name: SMTP_USER
Value: 你的163邮箱（例如：yourname@163.com）

Name: SMTP_PASS
Value: 刚才设置的授权密码

Name: TO_EMAIL
Value: 接收邮件的邮箱地址
```

---

## 🚀 方案 4：Mailgun

### 优势
- ✅ 免费额度大：每月 5000 封
- ✅ 国内可访问
- ✅ 专业的邮件服务

### 注册步骤

1. **访问 Mailgun**
   ```
   https://www.mailgun.com/
   ```

2. **注册账户**
   - 点击 "Sign Up"
   - 填写邮箱、密码
   - 验证邮箱

3. **获取 API Key**
   - 登录后进入 Dashboard
   - 点击右上角的用户名 > API Keys
   - 复制 "Private API key"

4. **获取域名**
   - 在 Dashboard 中找到 "Sending" > "Domains"
   - 使用 Mailgun 提供的沙盒域名（sandbox开头）
   - 或添加自己的域名

5. **配置 GitHub Secrets**

```
Name: MAILGUN_API_KEY
Value: 你的 Mailgun API Key

Name: MAILGUN_DOMAIN
Value: 你的域名（例如：sandboxXXX.mailgun.org）

Name: SMTP_USER
Value: 任意邮箱地址

Name: TO_EMAIL
Value: 接收邮件的邮箱地址
```

---

## 💡 我的推荐

### 如果你想最快配置（5分钟）
👉 **选择 QQ 邮箱或 163 邮箱**
- 不需要注册新服务
- 只需要开启 SMTP 并获取授权码
- 立即可用

### 如果你想要更专业的方案
👉 **选择 Resend**
- 界面现代化
- 提供详细的发送统计
- 免费额度充足

---

## 🔧 需要我帮你修改代码吗？

告诉我你选择哪个方案，我会立即帮你修改代码以支持该方案。

例如：
- "我选择 QQ 邮箱"
- "我选择 163 邮箱"
- "我选择 Resend"
- "我选择 Mailgun"
