# SendGrid 完整注册和配置指南

## 📝 为什么选择 SendGrid

- ✅ 免费额度：每天 100 封邮件（足够个人使用）
- ✅ 无需复杂的 SMTP 配置
- ✅ 不需要应用专用密码
- ✅ 稳定可靠的邮件发送服务
- ✅ 提供详细的发送统计

## 🚀 第一步：注册 SendGrid 账户

### 1. 访问 SendGrid 官网
打开浏览器，访问：https://sendgrid.com/

### 2. 点击注册
- 点击右上角的 **"Start for Free"** 或 **"Sign Up"** 按钮

### 3. 填写注册信息
需要填写以下信息：
- **Email**: 你的邮箱地址（用于登录）
- **Password**: 设置一个强密码
- **First Name**: 名字
- **Last Name**: 姓氏
- **Company**: 公司名称（可以填写个人名字或 "Personal"）
- **Website**: 网站（可以填写你的 GitHub 仓库地址）

### 4. 选择账户类型
- 选择 **"Free"** 免费计划
- 点击 **"Create Account"**

### 5. 验证邮箱
- 检查你的邮箱
- 打开 SendGrid 发送的验证邮件
- 点击邮件中的验证链接

## 📧 第二步：完成账户设置

### 1. 登录 SendGrid
使用刚才注册的邮箱和密码登录

### 2. 完成问卷调查（可能需要）
SendGrid 可能会要求你回答一些问题：
- **What's your role?** 选择 "Developer" 或 "Other"
- **What do you plan to send?** 选择 "Transactional Emails"
- **How many emails per month?** 选择 "Less than 1,000"
- **What's your use case?** 填写 "Personal tech news notifications"

### 3. 跳过单点登录（SSO）
如果提示设置 SSO，点击 **"Skip for now"**

## 🔑 第三步：创建 API Key

### 1. 进入 API Keys 页面
- 点击左侧菜单的 **"Settings"**
- 点击 **"API Keys"**
- 或直接访问：https://app.sendgrid.com/settings/api_keys

### 2. 创建新的 API Key
- 点击右上角的 **"Create API Key"** 按钮

### 3. 配置 API Key
填写以下信息：

**API Key Name（API Key 名称）:**
```
TechNewsAction
```

**API Key Permissions（权限）:**
选择以下任一选项：
- **Full Access**（完全访问）- 推荐，最简单
- 或者选择 **Restricted Access**，然后只勾选 **"Mail Send"** 权限

### 4. 创建并复制 API Key
- 点击 **"Create & View"** 按钮
- **重要：立即复制显示的 API Key！**
- API Key 格式类似：`SG.xxxxxxxxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy`
- **这个 Key 只会显示一次，关闭后无法再查看！**

### 5. 保存 API Key
将复制的 API Key 保存到安全的地方（稍后需要添加到 GitHub Secrets）

## ✅ 第四步：验证发件人身份（重要！）

SendGrid 要求验证发件人身份才能发送邮件。

### 方法 1：单一发件人验证（推荐，最简单）

1. **进入 Sender Authentication 页面**
   - 点击左侧菜单 **"Settings"**
   - 点击 **"Sender Authentication"**
   - 或访问：https://app.sendgrid.com/settings/sender_auth

2. **选择 Single Sender Verification**
   - 在 "Sender Identity" 部分
   - 点击 **"Get Started"** 或 **"Create New Sender"**

3. **填写发件人信息**
   ```
   From Name: 科技资讯推送
   From Email Address: 你的邮箱地址（必须是真实可用的邮箱）
   Reply To: 你的邮箱地址（同上）
   Company Address: 随意填写
   City: 随意填写
   State: 随意填写
   Zip Code: 随意填写
   Country: 选择你的国家
   ```

4. **创建并验证**
   - 点击 **"Create"**
   - SendGrid 会发送验证邮件到你填写的邮箱
   - 打开邮件，点击验证链接
   - 看到 "Verified" 状态即可

### 方法 2：域名验证（可选，更专业）

如果你有自己的域名，可以进行域名验证：
1. 在 Sender Authentication 页面选择 "Domain Authentication"
2. 按照提示添加 DNS 记录
3. 等待验证完成

**注意：个人使用推荐方法 1（单一发件人验证）即可。**

## 🎯 第五步：配置 GitHub Secrets

现在你已经有了：
- ✅ SendGrid API Key
- ✅ 验证过的发件人邮箱

### 在 GitHub 仓库中添加 Secrets

1. 进入你的 GitHub 仓库
2. 点击 **Settings** > **Secrets and variables** > **Actions**
3. 点击 **"New repository secret"**

添加以下 3 个 secrets：

**Secret 1:**
```
Name: SMTP_USER
Value: 你验证过的发件人邮箱地址
```

**Secret 2:**
```
Name: TO_EMAIL
Value: 接收邮件的邮箱地址（可以是任意邮箱）
```

**Secret 3:**
```
Name: SENDGRID_API_KEY
Value: 你复制的 SendGrid API Key（SG.开头的长字符串）
```

## 🧪 第六步：测试发送

### 在 GitHub Actions 中测试

1. 进入仓库的 **Actions** 页面
2. 选择 **"Daily Tech News Push"** 工作流
3. 点击 **"Run workflow"**
4. 点击绿色的 **"Run workflow"** 按钮
5. 等待 1-2 分钟执行完成

### 检查结果

1. **查看 Actions 日志**
   - 点击运行记录
   - 查看 "Fetch tech news and push" 步骤
   - 应该看到 "✅ SendGrid 邮件发送成功"

2. **检查邮箱**
   - 查看 TO_EMAIL 配置的邮箱
   - 如果没有，检查垃圾邮件文件夹
   - 应该收到一封科技资讯邮件

## 🔍 常见问题排查

### 问题 1：API Key 无效

**错误信息：** `401 Unauthorized` 或 `403 Forbidden`

**解决方法：**
- 确认 API Key 完整复制（包括 `SG.` 前缀）
- 确认 API Key 有 "Mail Send" 权限
- 重新创建一个新的 API Key

### 问题 2：发件人未验证

**错误信息：** `The from address does not match a verified Sender Identity`

**解决方法：**
- 确认已完成单一发件人验证
- 确认 SMTP_USER 的邮箱地址与验证的发件人邮箱一致
- 检查验证邮件中的链接是否已点击

### 问题 3：未收到邮件

**检查清单：**
- ✅ 检查垃圾邮件文件夹
- ✅ 确认 TO_EMAIL 地址正确
- ✅ 查看 SendGrid 控制台的 Activity Feed
- ✅ 查看 GitHub Actions 日志

### 问题 4：超出免费额度

**免费额度：** 每天 100 封邮件

**解决方法：**
- 每天只运行一次（默认配置）
- 如果需要更多，考虑升级计划

## 📊 监控邮件发送

### 查看发送统计

1. 登录 SendGrid
2. 点击左侧菜单 **"Activity"**
3. 可以看到：
   - 发送成功的邮件数量
   - 打开率
   - 点击率
   - 退信情况

### 查看详细日志

1. 点击 **"Activity Feed"**
2. 可以看到每封邮件的详细状态
3. 包括发送时间、收件人、状态等

## 🎉 完成！

现在你已经完成了 SendGrid 的完整配置，可以稳定地接收每日科技资讯了！

## 📚 相关资源

- SendGrid 官方文档：https://docs.sendgrid.com/
- API Key 管理：https://app.sendgrid.com/settings/api_keys
- 发件人验证：https://app.sendgrid.com/settings/sender_auth
- 发送统计：https://app.sendgrid.com/statistics

## 💡 提示

- 保管好你的 API Key，不要泄露
- 定期检查 SendGrid 控制台的发送统计
- 如果长期不用，可以删除 API Key
- 免费账户足够个人使用，无需升级
