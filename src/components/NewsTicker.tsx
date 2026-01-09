import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Newspaper, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  timestamp: number;
  url: string;
  category: 'general' | 'forex' | 'crypto' | 'merger';
  sentiment?: 'positive' | 'negative' | 'neutral';
  translatedTitle?: string;
  translatedSummary?: string;
}

interface NewsTickerProps {
  finnhubApiKey?: string;
}

export function NewsTicker({ finnhubApiKey = '' }: NewsTickerProps) {
  const [generalNews, setGeneralNews] = useState<NewsItem[]>([]);
  const [forexNews, setForexNews] = useState<NewsItem[]>([]);
  const [cryptoNews, setCryptoNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    loadNews();

    // 每1分钟刷新一次新闻，保持实时性
    const interval = setInterval(loadNews, 60 * 1000);

    return () => clearInterval(interval);
  }, [finnhubApiKey]);

  // 当新闻加载完成后，自动翻译
  useEffect(() => {
    if (autoTranslate && !loading && (generalNews.length > 0 || forexNews.length > 0 || cryptoNews.length > 0)) {
      translateAllNews();
    }
  }, [generalNews, forexNews, cryptoNews, loading, autoTranslate]);

  const loadNews = async () => {
    setLoading(true);

    try {
      if (finnhubApiKey) {
        // 使用Finnhub API
        await loadFinnhubNews();
      } else {
        // 使用示例数据
        loadSampleNews();
      }
    } catch (error) {
      console.error('Failed to load news:', error);
      loadSampleNews();
    }

    setLoading(false);
    setLastUpdate(new Date());
  };

  const loadFinnhubNews = async () => {
    const categories = ['general', 'forex', 'crypto'];

    for (const category of categories) {
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/news?category=${category}&token=${finnhubApiKey}`
        );
        const data = await response.json();

        const processed: NewsItem[] = data.slice(0, 10).map((item: any) => {
          // Finnhub datetime 是秒级时间戳，确保转换为秒级
          let timestamp = item.datetime;
          if (timestamp > 10000000000) {
            // 如果是毫秒级，转换为秒级
            timestamp = Math.floor(timestamp / 1000);
          }

          return {
            id: item.id,
            title: item.headline,
            summary: item.summary,
            source: item.source,
            timestamp: timestamp,
            url: item.url,
            category: category as any,
            sentiment: analyzeSentiment(item.summary),
          };
        });

        if (category === 'general') setGeneralNews(processed);
        else if (category === 'forex') setForexNews(processed);
        else if (category === 'crypto') setCryptoNews(processed);
      } catch (error) {
        console.error(`Failed to load ${category} news:`, error);
      }
    }
  };

  const loadSampleNews = () => {
    const sampleGeneral: NewsItem[] = [
      {
        id: '1',
        title: '美联储暗示2024年可能降息三次',
        summary: '美联储会议纪要显示，多数官员支持在今年进行三次降息，以应对通胀放缓和经济增长放缓的风险。',
        source: '财联社',
        timestamp: Date.now() / 1000 - 3600,
        url: '#',
        category: 'general',
        sentiment: 'positive',
      },
      {
        id: '2',
        title: '中国制造业PMI超预期回升',
        summary: '1月制造业PMI录得50.8，高于预期50.2，显示制造业景气度明显改善。',
        source: '东方财富',
        timestamp: Date.now() / 1000 - 7200,
        url: '#',
        category: 'general',
        sentiment: 'positive',
      },
      {
        id: '3',
        title: '欧佩克+维持减产政策不变',
        summary: '欧佩克+会议决定将当前减产政策延长至2024年第二季度，以支撑油价。',
        source: '路透社',
        timestamp: Date.now() / 1000 - 10800,
        url: '#',
        category: 'general',
        sentiment: 'neutral',
      },
      {
        id: '4',
        title: '美股科技股财报季来袭',
        summary: '本周将有多家大型科技公司发布财报，市场关注AI相关业务增长情况。',
        source: 'CNBC',
        timestamp: Date.now() / 1000 - 14400,
        url: '#',
        category: 'general',
        sentiment: 'neutral',
      },
      {
        id: '5',
        title: '日本央行维持超宽松货币政策',
        summary: '日本央行决定继续实施负利率政策，并表示暂无退出超宽松货币计划的计划。',
        source: '日经新闻',
        timestamp: Date.now() / 1000 - 18000,
        url: '#',
        category: 'general',
        sentiment: 'neutral',
      },
    ];

    const sampleForex: NewsItem[] = [
      {
        id: '6',
        title: '美元指数承压下行',
        summary: '受美联储降息预期影响，美元指数跌至三周低点，非美货币普遍反弹。',
        source: 'FXStreet',
        timestamp: Date.now() / 1000 - 3600,
        url: '#',
        category: 'forex',
        sentiment: 'negative',
      },
      {
        id: '7',
        title: '欧元区通胀数据符合预期',
        summary: '欧元区1月CPI初值录得2.8%，符合市场预期，欧央行降息预期升温。',
        source: '彭博社',
        timestamp: Date.now() / 1000 - 7200,
        url: '#',
        category: 'forex',
        sentiment: 'neutral',
      },
    ];

    const sampleCrypto: NewsItem[] = [
      {
        id: '8',
        title: '比特币ETF连续五日资金净流入',
        summary: '现货比特币ETF持续吸引资金流入，累计资产管理规模突破250亿美元。',
        source: 'CoinDesk',
        timestamp: Date.now() / 1000 - 3600,
        url: '#',
        category: 'crypto',
        sentiment: 'positive',
      },
      {
        id: '9',
        title: '以太坊Layer2交易量创历史新高',
        summary: '以太坊Layer2网络日均交易量突破200万笔，显示扩容方案取得显著成效。',
        source: 'Decrypt',
        timestamp: Date.now() / 1000 - 7200,
        url: '#',
        category: 'crypto',
        sentiment: 'positive',
      },
    ];

    setGeneralNews(sampleGeneral);
    setForexNews(sampleForex);
    setCryptoNews(sampleCrypto);
  };

  const analyzeSentiment = (text: string): 'positive' | 'negative' | 'neutral' => {
    const positiveWords = ['rise', 'gain', 'growth', 'surge', 'rally', 'breakthrough', 'beat', 'exceed', 'strong', 'bullish', '上涨', '增长', '突破', '超预期'];
    const negativeWords = ['fall', 'drop', 'decline', 'loss', 'plunge', 'crash', 'weak', 'bearish', 'concern', 'risk', '下跌', '下降', '风险', '担忧'];

    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  };

  // 使用免费的翻译API翻译新闻
  const translateText = async (text: string): Promise<string> => {
    try {
      // 使用 MyMemory Translation API（免费，无需密钥）
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-CN`
      );
      const data = await response.json();

      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        return data.responseData.translatedText;
      }

      // 如果API失败，返回原文
      return text;
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    }
  };

  // 翻译所有新闻
  const translateAllNews = async () => {
    setIsTranslating(true);

    try {
      // 翻译综合新闻
      const translatedGeneral = await Promise.all(
        generalNews.map(async (news) => ({
          ...news,
          translatedTitle: await translateText(news.title),
          translatedSummary: await translateText(news.summary),
        }))
      );
      setGeneralNews(translatedGeneral);

      // 翻译外汇新闻
      const translatedForex = await Promise.all(
        forexNews.map(async (news) => ({
          ...news,
          translatedTitle: await translateText(news.title),
          translatedSummary: await translateText(news.summary),
        }))
      );
      setForexNews(translatedForex);

      // 翻译加密货币新闻
      const translatedCrypto = await Promise.all(
        cryptoNews.map(async (news) => ({
          ...news,
          translatedTitle: await translateText(news.title),
          translatedSummary: await translateText(news.summary),
        }))
      );
      setCryptoNews(translatedCrypto);
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;
    return new Date(timestamp * 1000).toLocaleDateString('zh-CN');
  };

  const getSentimentIcon = (sentiment?: 'positive' | 'negative' | 'neutral') => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const NewsList = ({ news, title }: { news: NewsItem[]; title: string }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{title}</h3>
        <Badge variant="outline">{news.length} 条</Badge>
      </div>
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {news.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {getSentimentIcon(item.sentiment)}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm mb-1 line-clamp-2">
                    {item.translatedTitle || item.title}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {item.translatedSummary || item.summary}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Badge variant="outline" className="text-xs">
                      {item.source}
                    </Badge>
                    <span>{formatTimestamp(item.timestamp)}</span>
                    {item.translatedTitle && (
                      <Badge variant="secondary" className="text-xs" style={{ background: '#dbeafe', color: '#1e40af' }}>
                        已翻译
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            实时财经新闻
            {isTranslating && <span className="text-sm text-blue-600">翻译中...</span>}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              更新: {lastUpdate.toLocaleTimeString('zh-CN')} · 每1分钟自动刷新
            </span>
            <Button variant="outline" size="sm" onClick={loadNews} disabled={loading}>
              {loading ? '刷新中...' : '手动刷新'}
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <label className="text-sm text-gray-600 flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoTranslate}
              onChange={(e) => setAutoTranslate(e.target.checked)}
              className="w-4 h-4"
            />
            自动翻译成中文
          </label>
          {!autoTranslate && (
            <Button variant="outline" size="sm" onClick={translateAllNews} disabled={isTranslating}>
              {isTranslating ? '翻译中...' : '立即翻译'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">综合新闻</TabsTrigger>
            <TabsTrigger value="forex">外汇</TabsTrigger>
            <TabsTrigger value="crypto">加密货币</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4">
            <NewsList news={generalNews} title="市场要闻" />
          </TabsContent>

          <TabsContent value="forex" className="mt-4">
            <NewsList news={forexNews} title="外汇动态" />
          </TabsContent>

          <TabsContent value="crypto" className="mt-4">
            <NewsList news={cryptoNews} title="加密货币" />
          </TabsContent>
        </Tabs>

        {!finnhubApiKey && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 当前显示示例数据。获取实时新闻：
            </p>
            <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
              <li>访问 https://finnhub.io 注册免费API key</li>
              <li>在设置中添加您的API key</li>
              <li>立即获取实时全球财经新闻！</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
