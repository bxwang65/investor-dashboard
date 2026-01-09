#!/usr/bin/env python3
"""
Transform holdingsData.ts to match Manager and Holding interfaces
"""

import re
import json
from datetime import datetime

# Read the original holdings data JSON file
json_file = 'src/holdingsData.json'
with open(json_file, 'r') as f:
    data = json.load(f)

# Get today's date
today = datetime.now().strftime('%Y-%m-%d')

def extract_percentage_from_company(company_text):
    """Extract percentage from company text like 'Flutter Entertainment Plc11.33% of portfolio'"""
    match = re.search(r'(\d+\.?\d*)%', company_text)
    if match:
        return float(match.group(1))
    return 0.0

def extract_price_from_company(company_text):
    """Extract price from company text like 'Reported Price*: $255.34'"""
    match = re.search(r'\$(\d+\.?\d*)', company_text)
    if match:
        return f"${match.group(1)}"
    return ""

def clean_company_name(company_text):
    """Extract clean company name without percentage and price info"""
    # Remove percentage and price info
    text = re.sub(r'\d+\.?\d*%\s+of\s+portfolio.*', '', company_text)
    text = re.sub(r'Reported\s+Price\*:\s*\$\d+\.?\d*', '', text)
    return text.strip()

# Transform each manager
transformed = []
for manager in data:
    # Transform holdings
    holdings = []
    for holding in manager.get("top_holdings", []):
        company_text = holding.get("company", "")

        cleaned_holding = {
            "symbol": holding.get("symbol", ""),
            "company": clean_company_name(company_text),
            "percentage": extract_percentage_from_company(company_text),
            "reportedPrice": extract_price_from_company(company_text)
        }
        holdings.append(cleaned_holding)

    # Extract numeric value from stock_count
    stock_count_str = manager.get("stock_count", "0")
    stock_count = int(re.sub(r'\D', '', stock_count_str))

    transformed_manager = {
        "id": manager.get("manager_id", ""),
        "name": manager.get("manager_name", ""),
        "portfolioValue": manager.get("portfolio_value", ""),
        "stockCount": stock_count,
        "holdings": holdings,
        "updatedAt": today
    }
    transformed.append(transformed_manager)

# Generate TypeScript code
ts_code = f"""import type {{ Manager }} from './types';

export const holdingsData = {json.dumps(transformed, indent=2, ensure_ascii=False)} as Manager[];
"""

# Write to file
with open('src/holdingsData.ts', 'w') as f:
    f.write(ts_code)

print(f"✅ Transformed {len(transformed)} managers")
print("✅ Fixed property names to match Manager interface")
print("✅ Parsed percentage and reportedPrice from company field")

# Show sample of transformed data
if len(transformed) > 0:
    sample_manager = transformed[0]
    if len(sample_manager["holdings"]) > 0:
        sample_holding = sample_manager["holdings"][0]
        print("\n📊 Sample transformed holding:")
        print(f"  Symbol: {sample_holding['symbol']}")
        print(f"  Company: {sample_holding['company']}")
        print(f"  Percentage: {sample_holding['percentage']}%")
        print(f"  Reported Price: {sample_holding['reportedPrice']}")
