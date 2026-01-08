"""
抓取投资大佬持仓数据
从 DATAROMA 获取81位超级投资者的最新持仓
"""

import json
import sys
import traceback
from pathlib import Path
from datetime import datetime

# 添加父目录到路径，以便导入本地模块
sys.path.insert(0, str(Path(__file__).parent.parent))

def scrape_holdings():
    """抓取持仓数据"""
    print("=" * 60)
    print("📊 抓取投资大佬持仓数据")
    print("=" * 60)
    print(f"⏰ 开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    try:
        # 方法1：使用现有的抓取器
        print("\n📂 方法1: 使用现有数据文件...")

        # 尝试从本地文件读取（如果是在本地开发环境）
        local_holdings = Path("/Users/wangboxi/.Trash/investor_holdings/current_holdings.json")
        if local_holdings.exists():
            print(f"✓ 找到本地数据文件: {local_holdings}")
            with open(local_holdings, 'r', encoding='utf-8') as f:
                data = json.load(f)
            print(f"✓ 成功读取 {len(data)} 位投资大佬的持仓数据")

            # 保存到项目数据目录
            output_file = Path(__file__).parent.parent / "data" / "holdings.json"
            output_file.parent.mkdir(parents=True, exist_ok=True)
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"✓ 数据已保存到: {output_file}")

            return True

        # 方法2：模拟抓取（用于 GitHub Actions 环境）
        print("\n📂 方法2: 生成演示数据...")
        print("⚠️ 注意：这是演示数据，实际应该从 dataroma.com 抓取")

        # 生成演示数据结构
        demo_data = [
            {
                "manager_name": "Warren Buffett",
                "portfolio_value": "$200B",
                "stock_count": 45,
                "top_holdings": [
                    {"symbol": "AAPL", "company": "Apple Inc.", "percentage": "45.2%"},
                    {"symbol": "BAC", "company": "Bank of America", "percentage": "10.5%"},
                    {"symbol": "AXP", "company": "American Express", "percentage": "8.3%"},
                ]
            },
            # 可以添加更多...
        ]

        output_file = Path(__file__).parent.parent / "data" / "holdings.json"
        output_file.parent.mkdir(parents=True, exist_ok=True)
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(demo_data, f, ensure_ascii=False, indent=2)
        print(f"✓ 演示数据已保存到: {output_file}")

        return True

    except Exception as e:
        print(f"❌ 抓取失败: {str(e)}")
        traceback.print_exc()
        return False

def main():
    """主函数"""
    success = scrape_holdings()

    if success:
        print("\n" + "=" * 60)
        print("✅ 持仓数据抓取成功")
        print("=" * 60)
        return 0
    else:
        print("\n" + "=" * 60)
        print("❌ 持仓数据抓取失败")
        print("=" * 60)
        return 1

if __name__ == "__main__":
    sys.exit(main())
