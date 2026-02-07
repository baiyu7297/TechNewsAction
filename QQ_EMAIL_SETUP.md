# QQ 邮箱配置指南（5分钟完成）

## 📧 第一步：开启 QQ 邮箱 SMTP 服务

### 1. 登录 QQ 邮箱
访问：https://mail.qq.com/
使用你的 QQ 号和密码登录

### 2. 进入设置页面
- 点击顶部的 **"设置"** 按钮
- 点击 **"账户"** 标签

### 3. 找到 SMTP 服务设置
向下滚动，找到 **"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"** 部分

### 4. 开启 SMTP 服务
找到以下选项之一：
- **"POP3/SMTP服务"** 
- 或 **"IMAP/SMTP服务"**（推荐）

点击后面的 **"开启"** 按钮

### 5. 验证身份
QQ 邮箱会要求你验证身份：

**方法 1：发送短信（推荐）**
- 选择 "发送短信"
- 使用绑定的手机号
- 按照提示发送短信到指定号码
- 短信内容格式：`配置邮件客户端`

**方法 2：密保问题**
- 如果没有绑定手机，可以回答密保问题

### 6. 获取授权码
验证成功后，QQ 邮箱会显示一个 **16位授权码**

**重要：**
- ✅ 这个授权码只显示一次，请立即复制保存
- ✅ 授权码格式类似：`abcdefghijklmnop`（16个字符）
- ✅ 这个授权码就是你的 SMTP 密码，不是你的 QQ 密码！

**如果忘记了授权码：**
- 可以点击 "生成授权码" 重新生成
- 旧的授权码会失效

---

## 🔑 第二步：配置 GitHub Secrets

### 1. 进入 GitHub 仓库
打开你 Fork 的 TechNewsAction 仓库

### 2. 进入 Secrets 设置
点击：**Settings** → **Secrets and variables** → **Actions**

### 3. 添加 3 个 Secrets

点击 **"New repository secret"** 按钮，依次添加：

#### Secret 1: SMTP_USER
```
Name: SMTP_USER
Value: 你的QQ邮箱地址（例如：123456789@qq.com）
```

#### Secret 2: SMTP_PASS
```
Name: SMTP_PASS
Value: 刚才获取的16位授权码（不是QQ密码！）
```

#### Secret 3: TO_EMAIL
```
Name: TO_EMAIL
Value: 接收邮件的邮箱地址（可以是任意邮箱，包括这个QQ邮箱本身）
```

**注意事项：**
- ✅ 确保没有多余的空格
- ✅ SMTP_PASS 是授权码，不是 QQ 密码
- ✅ TO_EMAIL 可以和 SMTP_USER 相同（发给自己）

---

## 🧪 第三步：测试发送

### 1. 提交代码
如果你修改了代码，先提交：
```bash
git add .
git commit -m "配置QQ邮箱发送"
git push
```

### 2. 手动运行 GitHub Actions
1. 进入仓库的 **Actions** 页面
2. 选择 **"Daily Tech News Push"** 工作流
3. 点击右侧的 **"Run workflow"** 按钮
4. 点击绿色的 **"Run workflow"** 确认
5. 等待 1-2 分钟

### 3. 查看执行日志
1. 点击刚才创建的运行记录
2. 点击 **"fetch-and-push-tech-news"** 任务
3. 展开 **"Fetch tech news and push"** 步骤
4. 查看日志输出

**成功的标志：**
```
📧 准备发送邮件...
   发件人: 123456789@qq.com
   收件人: your_email@example.com
   邮箱类型: QQ邮箱
   SMTP服务器: smtp.qq.com:465
   使用 nodemailer 发送
   验证 SMTP 连接...
   ✅ SMTP 连接验证成功
✅ 邮件发送成功!
   Message ID: <xxx@qq.com>
```

### 4. 检查邮箱
- 打开 TO_EMAIL 配置的邮箱
- 查找来自你 QQ 邮箱的邮件
- 主题：📰 科技资讯 - 2026-02-07
- 如果没有，检查垃圾邮件文件夹

---

## 🔍 常见问题排查

### 问题 1：授权码错误

**错误信息：**
```
Error: Invalid login: 535 Login Fail
```

**原因：**
- 使用了 QQ 密码而不是授权码
- 授权码输入错误
- 授权码已过期

**解决方法：**
1. 重新进入 QQ 邮箱设置
2. 重新生成授权码
3. 更新 GitHub Secret 中的 SMTP_PASS

### 问题 2：SMTP 服务未开启

**错误信息：**
```
Error: Connection timeout
```

**解决方法：**
1. 确认已在 QQ 邮箱中开启 SMTP 服务
2. 检查是否选择了 "IMAP/SMTP服务"（推荐）

### 问题 3：发送频率限制

**错误信息：**
```
Error: Mail send frequency exceeds limit
```

**原因：**
QQ 邮箱对发送频率有限制

**解决方法：**
- 不要频繁测试
- 每天只运行一次（默认配置）
- 等待几分钟后再试

### 问题 4：收件人地址错误

**错误信息：**
```
Error: Invalid recipient
```

**解决方法：**
- 检查 TO_EMAIL 是否正确
- 确保邮箱地址格式正确

### 问题 5：nodemailer 未安装

**错误信息：**
```
nodemailer 不可用
```

**解决方法：**
这是正常的，代码会自动处理。如果看到这个提示但仍然发送成功，说明使用了备用方案。

---

## 📊 验证配置是否正确

### 检查清单

- [ ] QQ 邮箱已开启 SMTP 服务
- [ ] 已获取 16 位授权码
- [ ] GitHub Secrets 中已添加 SMTP_USER
- [ ] GitHub Secrets 中已添加 SMTP_PASS（授权码）
- [ ] GitHub Secrets 中已添加 TO_EMAIL
- [ ] 代码已提交到 GitHub
- [ ] 已手动运行 GitHub Actions
- [ ] 查看了执行日志
- [ ] 检查了邮箱（包括垃圾邮件）

---

## 🎉 成功！

如果你收到了邮件，恭喜！配置成功！

现在：
- ✅ 每天早上 8 点会自动发送科技资讯
- ✅ 可以随时手动触发
- ✅ 邮件包含 Hacker News、GitHub Trending、Dev.to 的内容

---

## 💡 其他国内邮箱

如果你想使用其他邮箱，代码已经支持：

### 163 邮箱
- SMTP 服务器：smtp.163.com
- 端口：465
- 同样需要开启 SMTP 并获取授权码

### 126 邮箱
- SMTP 服务器：smtp.126.com
- 端口：465
- 同样需要开启 SMTP 并获取授权码

配置方法与 QQ 邮箱完全相同，只需要：
1. 在对应邮箱中开启 SMTP
2. 获取授权码
3. 更新 GitHub Secrets

代码会自动识别邮箱类型并使用正确的 SMTP 配置！

---

## 📞 需要帮助？

如果遇到问题：
1. 查看 GitHub Actions 的详细日志
2. 检查上面的常见问题
3. 确认所有配置步骤都已完成
