import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function TradingViewWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 延迟加载TradingView，让页面先渲染主要内容
    const timer = setTimeout(() => {
      // 创建TradingView新闻滚动条脚本
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-news-ticker.js';
      script.type = 'text/javascript';
      script.async = true;
      script.onload = () => setIsLoaded(true);
      script.onerror = () => setIsLoaded(true); // 即使失败也标记为已加载，显示占位

      const config = {
        feedMode: 'all_symbols',
        isTransparent: false,
        displayMode: 'adaptive',
        colorTheme: 'light',
        locale: 'zh_CN',
      };

      try {
        script.innerHTML = JSON.stringify(config);
      } catch (e) {
        console.error('TradingView config error:', e);
      }

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(script);
      }
    }, 500); // 延迟500ms加载

    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="mb-4">
      <CardContent className="p-0">
        {!isLoaded && (
          <div className="h-16 flex items-center justify-center bg-slate-50">
            <div className="text-slate-400 text-sm">加载市场资讯中...</div>
          </div>
        )}
        <div className="tradingview-widget-container" ref={containerRef} style={{ display: isLoaded ? 'block' : 'none' }}>
          <div className="tradingview-widget-container__widget"></div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TradingViewTickerTape() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'FOREXCOM:SPXUSD', title: '标普500' },
        { proName: 'FOREXCOM:NSXUSD', title: '纳斯达克' },
        { proName: 'FX_IDC:EURIDR', title: 'EUR/USD' },
        { proName: 'BITSTAMP:BTCUSD', title: 'BTC/USD' },
        { proName: 'BITSTAMP:ETHUSD', title: 'ETH/USD' },
      ],
      showSymbolLogo: true,
      colorTheme: 'light',
      isTransparent: false,
      displayMode: 'adaptive',
      locale: 'zh_CN',
    });

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="tradingview-widget-container mb-4" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}
