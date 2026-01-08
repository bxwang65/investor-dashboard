# 🏆 投资大佬仪表板

实时跟踪81位超级投资者的投资组合变化，基于真实价格数据计算收益率。

**在线演示**：[待部署]
**最后更新**：2026-01-07
**数据来源**：DATAROMA + Yahoo Finance

---

## ✨ 功能特性

### 📊 可视化仪表板
- **持仓分布**：行业分布饼图、最受关注股票
- **D3.js 图表**：时间线、力导向图
- **Plotly 3D**：3D散点图、动画展示
- **收益排行**：Top 10 投资组合真实收益

### 📰 实时新闻
- TradingView 市场概览
- Finnhub 实时新闻（3个类别）
- 自动刷新（5分钟）

### 🔍 交互功能
- 搜索投资者、股票代码、公司名称
- 持仓变化通知（新增、删除、增持、减持）
- 导出数据为 JSON

### 💰 真实数据
- 81位投资大佬持仓（DATAROMA）
- 真实历史价格（Yahoo Finance via OpenBB）
- 加权收益率计算
- 每天上午10点自动更新

---

## 🚀 快速开始

### 在线访问

访问 [Netlify URL]（待部署）即可查看，无需安装。

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/investor-dashboard.git
cd investor-dashboard

# 使用 Netlify CLI 本地预览
npx netlify-cli dev

# 访问 http://localhost:8888
```

---

## 📁 项目结构

```
investor-dashboard/
├── .github/
│   └── workflows/
│       └── update-data.yml    # GitHub Actions 自动更新
├── data/
│   ├── holdings.json          # 持仓数据（自动更新）
│   └── performance.json       # 收益数据（自动更新）
├── scripts/
│   ├── scrape_holdings.py     # 抓取持仓
│   ├── calculate_performance.py # 计算收益
│   └── update_dashboard.py    # 更新仪表板
├── netlify/
│   └── functions/             # Serverless Functions
├── index.html                 # 主仪表板
├── netlify.toml              # Netlify 配置
└── README.md                 # 本文件
```

---

## 🔄 自动更新

系统使用 GitHub Actions 每天自动更新：

```yaml
schedule:
  - cron: '0 1 * * *'  # UTC 01:00 = 北京时间 09:00
```

**更新流程**：
1. 抓取81位投资大佬持仓（dataroma.com）
2. 获取真实历史价格（Yahoo Finance）
3. 计算Top 10组合收益率
4. 更新数据文件
5. 自动提交并触发 Netlify 重新部署

**手动触发**：
- GitHub → Actions → Update Dashboard Data → Run workflow

---

## 📊 数据说明

### 持仓数据
- **来源**：[DATAROMA](https://www.dataroma.com)
- **更新**：每天上午10点
- **覆盖**：81位投资大佬，~1,500只股票

### 价格数据
- **来源**：Yahoo Finance（via OpenBB）
- **延迟**：15分钟（免费 API）
- **周期**：5年、2年、1年、6个月、3个月

### 收益计算
```
组合收益 = Σ(股票收益率 × 持仓比例)
```

基于前15大持仓加权计算。

---

## 🛠️ 技术栈

### 前端
- **React 19.2.3** + TypeScript
- **Tailwind CSS 3.4.1** + shadcn/ui
- **D3.js 7.9.0**（自定义可视化）
- **Plotly.js 3.3.1**（3D图表）
- **Recharts 3.6.0**（常规图表）

### 后端
- **Python 3.10+**
- **OpenBB**（金融数据）
- **BeautifulSoup 4**（网页抓取）
- **schedule**（任务调度）

### 部署
- **Netlify**（静态托管 + CDN）
- **GitHub Actions**（CI/CD）
- **Netlify Functions**（API 代理）

---

## 📈 投资大佬列表

Top 10（按组合规模）：

1. Warren Buffett - Berkshire Hathaway
2. Bill Gates - Cascade Investment
3. Bill Ackman - Pershing Square
4. Carl Icahn - Icahn Capital
5. Richard Pzena - Pzena Investment
6. Mason Hawkins - Longleaf Partners
7. Wallace Weitz - Weitz Funds
8. John Rogers - Ariel Investments
9. Christopher Bloomstran - Semper Augustus
10. Dennis Hong - ShawSpring Partners

共81位：[完整列表](./data/holdings.json)

---

## 🔧 配置

### 环境变量

GitHub Secrets：
```
NETLIFY_BUILD_HOOK=https://api.netlify.com/build_hooks/xxx
FINNHUB_API_KEY=d5f3lhpr01qvseltqf8gd5f3lhpr01qvseltqf90
```

Netlify Environment Variables：
```
FINNHUB_API_KEY=d5f3lhpr01qvseltqf8gd5f3lhpr01qvseltqf90
```

---

## 📝 开发

### 本地开发

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 本地预览
netlify dev

# 部署到 Netlify
netlify deploy --prod
```

### 脚本开发

```bash
# 测试持仓抓取
python scripts/scrape_holdings.py

# 测试收益计算
python scripts/calculate_performance.py

# 完整更新流程
python scripts/update_dashboard.py
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献指南
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 📞 联系方式

**开发者**：Claude AI Assistant
**用户**：wangboxi
**项目地址**：https://github.com/YOUR_USERNAME/investor-dashboard

---

## 🙏 致谢

### 数据来源
- [DATAROMA](https://www.dataroma.com) - 持仓数据
- [Yahoo Finance](https://finance.yahoo.com) - 价格数据
- [Finnhub](https://finnhub.io) - 实时新闻
- [TradingView](https://www.tradingview.com) - 市场数据

### 开源项目
- [React](https://react.dev)
- [D3.js](https://d3js.org)
- [Plotly](https://plotly.com)
- [OpenBB](https://openbb.co)
- [shadcn/ui](https://ui.shadcn.com)

---

## ⭐ Star History

如果这个项目对你有帮助，请给个 Star ⭐

---

**最后更新**：2026-01-07
**版本**：1.0.0
**状态**：✅ 生产就绪
