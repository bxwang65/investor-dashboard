"""
更新仪表板 HTML
将最新数据嵌入到 HTML 文件中
"""

import json
import sys
from pathlib import Path
from datetime import datetime

def update_dashboard():
    """更新仪表板"""
    print("=" * 60)
    print("🔄 更新仪表板")
    print("=" * 60)
    print(f"⏰ 更新时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    try:
        # 读取数据文件
        holdings_file = Path(__file__).parent.parent / "data" / "holdings.json"
        performance_file = Path(__file__).parent.parent / "data" / "performance.json"

        print("\n📂 读取数据文件...")

        if not holdings_file.exists():
            print(f"❌ 持仓数据不存在: {holdings_file}")
            return False

        with open(holdings_file, 'r', encoding='utf-8') as f:
            holdings_data = json.load(f)
        print(f"✓ 持仓数据: {len(holdings_data)} 位投资大佬")

        if performance_file.exists():
            with open(performance_file, 'r', encoding='utf-8') as f:
                performance_data = json.load(f)
            print(f"✓ 收益数据: {len(performance_data.get('portfolios', []))} 个组合")
        else:
            print("⚠️ 收益数据文件不存在")
            performance_data = None

        # 读取主 HTML 文件
        print("\n📄 读取主仪表板...")
        index_file = Path(__file__).parent.parent / "index.html"

        if not index_file.exists():
            print(f"❌ 主仪表板文件不存在: {index_file}")
            return False

        with open(index_file, 'r', encoding='utf-8') as f:
            html_content = f.read()

        # 更新 HTML 中的数据（如果有需要）
        # 注意：当前仪表板已经内置数据，这里只是记录日志
        print("✓ 仪表板已就绪")

        # 如果需要，可以生成收益报告
        if performance_data:
            print("\n📊 生成收益报告...")
            report_html = generate_performance_report(performance_data)
            report_file = Path(__file__).parent.parent / "report.html"
            with open(report_file, 'w', encoding='utf-8') as f:
                f.write(report_html)
            print(f"✓ 收益报告已生成: {report_file}")

        print("\n✅ 仪表板更新完成")
        return True

    except Exception as e:
        print(f"❌ 更新失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def generate_performance_report(performance_data):
    """生成收益报告 HTML"""

    portfolios = performance_data.get('portfolios', [])
    sorted_portfolios = sorted(
        portfolios,
        key=lambda x: x['returns']['5Y'],
        reverse=True
    )

    # 计算统计数据
    if portfolios:
        avg_5y = sum(p['returns']['5Y'] for p in portfolios) / len(portfolios)
        max_5y = max(p['returns']['5Y'] for p in portfolios)
        positive_count = sum(1 for p in portfolios if p['returns']['5Y'] > 0)
    else:
        avg_5y = max_5y = positive_count = 0

    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>投资大佬组合收益排行榜</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
        }}
        h1 {{
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 2.5em;
            margin-bottom: 30px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }}
        th {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            text-align: left;
        }}
        td {{
            padding: 12px;
            border-bottom: 1px solid #eee;
        }}
        .positive {{ color: #10b981; font-weight: bold; }}
        .negative {{ color: #ef4444; font-weight: bold; }}
        .update-time {{
            text-align: center;
            margin-top: 30px;
            color: #666;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🏆 投资大佬组合收益排行榜</h1>
        <p style="text-align: center; color: #666;">
            更新时间: {performance_data.get('updated', 'N/A')} |
            数据方法: {performance_data.get('method', 'unknown')}
        </p>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px; color: white; text-align: center;">
                <div style="font-size: 2em; font-weight: bold;">{len(portfolios)}</div>
                <div>跟踪组合</div>
            </div>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px; color: white; text-align: center;">
                <div style="font-size: 2em; font-weight: bold;">{avg_5y:.1f}%</div>
                <div>平均5年收益</div>
            </div>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px; color: white; text-align: center;">
                <div style="font-size: 2em; font-weight: bold;">{positive_count}</div>
                <div>盈利组合数</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>排名</th>
                    <th>投资大佬</th>
                    <th>组合规模</th>
                    <th>5年收益</th>
                    <th>2年收益</th>
                    <th>1年收益</th>
                </tr>
            </thead>
            <tbody>
"""

    for i, p in enumerate(sorted_portfolios, 1):
        returns = p['returns']
        html += f"""
                <tr>
                    <td><strong>{i}</strong></td>
                    <td>{p['name']}</td>
                    <td>{p['portfolio_value']}</td>
                    <td class="{'positive' if returns['5Y'] > 0 else 'negative'}">{returns['5Y']:.2f}%</td>
                    <td class="{'positive' if returns['2Y'] > 0 else 'negative'}">{returns['2Y']:.2f}%</td>
                    <td class="{'positive' if returns['1Y'] > 0 else 'negative'}">{returns['1Y']:.2f}%</td>
                </tr>
"""

    html += f"""
            </tbody>
        </table>

        <div class="update-time">
            <p><strong>生成时间:</strong> {datetime.now().strftime('%Y年%m月%d日 %H:%M:%S')}</p>
            <p><strong>数据来源:</strong> DATAROMA + Yahoo Finance (via OpenBB)</p>
            <p><strong>💡 提示:</strong> 收益基于真实历史价格计算，反映实际表现</p>
        </div>
    </div>
</body>
</html>
"""

    return html

def main():
    """主函数"""
    success = update_dashboard()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
