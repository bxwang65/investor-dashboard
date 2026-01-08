# 🚀 Netlify 完整部署指南

## ✅ 准备工作已完成

所有文件已准备就绪，现在开始部署！

---

## 📋 部署前检查清单

### 必需账号
- [x] GitHub 账号
- [ ] Netlify 账号（https://app.netlify.com）

### 文件检查
- [x] index.html（主仪表板）
- [x] data/holdings.json（持仓数据）
- [x] scripts/*.py（自动化脚本）
- [x] .github/workflows/update-data.yml（GitHub Actions）
- [x] netlify.toml（Netlify 配置）
- [x] README.md（项目说明）

---

## 步骤1：创建 GitHub 仓库（5分钟）

### 1.1 在 GitHub 创建新仓库

1. 访问：https://github.com/new
2. 仓库名称：`investor-dashboard`
3. 设为 Public
4. **不要**勾选 "Add a README file"
5. 点击 "Create repository"

### 1.2 推送代码到 GitHub

```bash
cd /Users/wangboxi/.Trash/investor-dashboard-netlify

# 初始化 Git
git init

# 添加所有文件
git add .

# 首次提交
git commit -m "✨ Initial commit: Investor dashboard with auto-update

Features:
- 81位投资大佬持仓可视化
- 真实价格数据计算
- 每天10点自动更新
- GitHub Actions + Netlify"

# 添加远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/investor-dashboard.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

**完成！** 代码已推送到 GitHub。

---

## 步骤2：连接 Netlify（3分钟）

### 2.1 部署到 Netlify

#### 方法A：通过网页界面（推荐）

1. 访问：https://app.netlify.com
2. 使用 GitHub 账号登录
3. 点击 "Add new site" → "Import from GitHub"
4. 选择 `investor-dashboard` 仓库
5. 配置构建设置：
   - **Build command**: (留空)
   - **Publish directory**: `/` (根目录)
6. 点击 "Deploy site"

**完成！** 等待1-2分钟，你的网站就上线了！

#### 方法B：使用 Netlify CLI

```bash
# 安装 Netlify CLI（如果未安装）
npm install -g netlify-cli

# 登录
netlify login

# 初始化
cd /Users/wangboxi/.Trash/investor-dashboard-netlify
netlify init

# 按提示操作：
# 1. 选择 Create & configure new site
# 2. 选择团队
# 3. 站点名称：investor-dashboard（可选）

# 部署
netlify deploy --prod
```

### 2.2 获取 Build Hook URL

1. 在 Netlify 打开你的站点
2. 进入：Settings → Build & deploy → Continuous deployment
3. 滚动到 "Build hooks"
4. 点击 "Add build hook"
5. 名称：`daily-update`
6. 复制生成的 URL（格式：`https://api.netlify.com/build_hooks/xxxxx`）

**保存这个 URL**，下一步需要用到！

---

## 步骤3：配置 GitHub Secrets（2分钟）

### 3.1 添加 Netlify Build Hook

1. 访问 GitHub 仓库：https://github.com/YOUR_USERNAME/investor-dashboard
2. 进入：Settings → Secrets and variables → Actions
3. 点击 "New repository secret"
4. 填写：
   - **Name**: `NETLIFY_BUILD_HOOK`
   - **Value**: (粘贴步骤2.2中复制的 URL)
5. 点击 "Add secret"

### 3.2 添加 Finnhub API Key（可选）

如果需要使用 Finnhub API：
1. 点击 "New repository secret"
2. 填写：
   - **Name**: `FINNHUB_API_KEY`
   - **Value**: `d5f3lhpr01qvseltqf8gd5f3lhpr01qvseltqf90`
3. 点击 "Add secret"

---

## 步骤4：配置 Netlify 环境变量（2分钟）

### 4.1 添加环境变量

1. 在 Netlify 站点中
2. 进入：Site settings → Environment variables
3. 点击 "Add a variable"
4. 填写：
   - **Key**: `FINNHUB_API_KEY`
   - **Value**: `d5f3lhpr01qvseltqf8gd5f3lhpr01qvseltqf90`
5. 点击 "Save"

---

## 步骤5：测试自动更新（5分钟）

### 5.1 手动触发 GitHub Actions

1. 访问 GitHub 仓库
2. 点击 "Actions" 标签
3. 选择 "🤖 Update Dashboard Data" 工作流
4. 点击 "Run workflow" 按钮
5. 选择 `main` 分支
6. 点击 "Run workflow"

### 5.2 查看运行日志

1. 等待几秒，刷新页面
2. 点击最新的运行记录
3. 查看各个步骤的输出：
   - ✅ Step 1: 抓取持仓数据
   - ✅ Step 2: 计算收益
   - ✅ Step 3: 更新仪表板
   - ✅ Step 4: 提交数据
   - ✅ Step 5: 触发 Netlify 部署

### 5.3 验证 Netlify 部署

1. 回到 Netlify
2. 查看 "Deploys" 标签
3. 应该看到一个新的部署（由 GitHub Actions 触发）
4. 等待部署完成（约1-2分钟）
5. 点击部署预览，查看更新后的网站

**完成！** 自动更新系统已配置完成！

---

## 🎉 完成！享受你的自动化仪表板

### 你的网站现在：

✅ **已部署**：访问你的 Netlify URL
✅ **自动更新**：每天 UTC 01:00 自动运行（北京时间上午9点）
✅ **真实数据**：基于 Yahoo Finance 真实价格
✅ **全球 CDN**：Netlify 全球加速

### 自动更新流程

```
每天上午9点
  ↓
GitHub Actions 自动运行
  ↓
1. 抓取81位大佬持仓
2. 计算真实收益
3. 更新数据文件
4. 提交到 GitHub
  ↓
触发 Netlify 重新部署
  ↓
全球 CDN 更新完成
```

---

## 📊 后续管理

### 查看自动更新日志

```bash
# GitHub Actions 日志
https://github.com/YOUR_USERNAME/investor-dashboard/actions

# Netlify 部署日志
https://app.netlify.com/sites/your-site/deploys
```

### 手动触发更新

访问：GitHub → Actions → Update Dashboard Data → Run workflow

### 修改更新时间

编辑 `.github/workflows/update-data.yml`：

```yaml
schedule:
  # 每天 UTC 02:00（北京时间上午10点）
  - cron: '0 2 * * *'
```

### 添加自定义域名

1. 在 Netlify：Domain management → Add custom domain
2. 输入域名（如：`investor.yourdomain.com`）
3. 按提示配置 DNS

---

## 🔧 故障排查

### 问题1：GitHub Actions 失败

**检查**：
1. Secrets 是否正确配置（NETLIFY_BUILD_HOOK）
2. 脚本是否有语法错误
3. 日志中的错误信息

**解决**：
- 查看 Actions 日志，定位错误步骤
- 在本地测试脚本：`python scripts/scrape_holdings.py`

### 问题2：Netlify 未触发部署

**检查**：
1. Build Hook URL 是否正确
2. GitHub Secrets 中的值是否完整
3. GitHub Actions 是否成功提交代码

**解决**：
- 重新生成 Build Hook
- 更新 GitHub Secret
- 手动触发 Actions 测试

### 问题3：数据未更新

**检查**：
1. GitHub Actions 是否成功运行
2. 数据文件是否在仓库中更新
3. Netlify 是否成功部署

**解决**：
- 检查 Actions 日志
- 查看最新提交的数据文件
- 清除浏览器缓存

---

## 📈 性能优化建议

### 1. 启用 Netlify 缓存

```toml
# netlify.toml
[[headers]]
  for = "/data/*"
  [headers.values]
    Cache-Control = "public, max-age=3600"
```

### 2. 使用 Netlify CDN

Netlify 自动提供全球 CDN，无需额外配置。

### 3. 优化图片

如果添加图片，使用 Netlify Image CDN：
```html
<img src="/image.jpg" alt="..." loading="lazy">
```

---

## 🎯 下一步优化

### 短期（1周内）
- [ ] 监控首次自动更新
- [ ] 验证数据准确性
- [ ] 测试移动端显示

### 中期（1个月内）
- [ ] 添加自定义域名
- [ ] 配置邮件通知
- [ ] 优化加载速度

### 长期（3个月内）
- [ ] 添加更多数据源
- [ ] 实现用户系统
- [ ] 开发移动 App

---

## 📞 支持

### 文档
- GitHub README：https://github.com/YOUR_USERNAME/investor-dashboard
- Netlify 文档：https://docs.netlify.com
- GitHub Actions 文档：https://docs.github.com/actions

### 常见问题
查看 Obsidian 笔记：`大佬投资/` 文件夹

### 联系
- 用户：wangboxi
- 开发者：Claude AI

---

## ✨ 总结

你现在拥有：
- ✅ 完整的投资大佬可视化仪表板
- ✅ 每天10点自动更新数据
- ✅ 真实价格数据计算
- ✅ 全球 CDN 加速
- ✅ 完全自动化系统

**系统状态**：✅ 生产就绪
**部署时间**：约15分钟
**维护成本**：几乎为零（完全自动化）

---

**祝你使用愉快！** 🎉

---

**最后更新**：2026-01-07 20:00
**下一步**：执行步骤1-5，完成部署！
