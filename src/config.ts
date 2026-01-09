/**
 * API配置文件
 *
 * 如何获取免费的Finnhub API Key:
 * 1. 访问 https://finnhub.io/
 * 2. 注册免费账户
 * 3. 在Dashboard获取API Key
 * 4. 将API Key粘贴到下方 finnhubApiKey 变量中
 *
 * 免费账户限制:
 * - 60次请求/分钟
 * - 无需信用卡
 * - 适合个人使用
 */

export const API_CONFIG = {
  // 在这里添加您的Finnhub API Key
  // 示例: finnhubApiKey: 'your_api_key_here'
  finnhubApiKey: 'd5f3lhpr01qvseltqf8gd5f3lhpr01qvseltqf90',

  // TradingView配置（无需API key，直接使用）
  tradingView: {
    locale: 'zh_CN', // 中文界面
    colorTheme: 'light', // 可选: 'light', 'dark'
  },

  // 新闻自动刷新间隔（毫秒）
  newsRefreshInterval: 5 * 60 * 1000, // 5分钟
};

/**
 * 检查是否已配置API Key
 */
export function hasApiKey(): boolean {
  return API_CONFIG.finnhubApiKey !== '';
}

/**
 * 获取API Key（如果需要）
 */
export function getApiKey(): string {
  return API_CONFIG.finnhubApiKey;
}
