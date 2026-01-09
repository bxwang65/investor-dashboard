import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DashboardHeader } from './components/DashboardHeader';
import { D3Timeline } from './components/d3/D3Timeline';
import { D3ForceGraph } from './components/d3/D3ForceGraph';
import { Plotly3DChart, PlotlyAnimatedChart } from './components/plotly/Plotly3DChart';
import { NewsTicker } from './components/NewsTicker';
import { TradingViewWidget, TradingViewTickerTape } from './components/TradingViewWidget';
import { NotificationPanel, generateMockChanges } from './components/NotificationPanel';
import type { HoldingChange } from './components/NotificationPanel';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { parseHoldingsData, processData, generateMockPerformanceData } from './lib/data';
import { holdingsData } from './holdingsData';
import { API_CONFIG } from './config';
import performanceRealData from './performanceData.json';
import type { Manager } from './types';
import {
  Search,
  Bell,
  User,
  Settings,
  Download,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
  '#f97316',
  '#6366f1',
];

function App() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [filteredManagers, setFilteredManagers] = useState<Manager[]>([]);
  const [wsConnected, setWsConnected] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [holdingChanges, setHoldingChanges] = useState<HoldingChange[]>([]);
  const [sortBy, setSortBy] = useState<'5Y' | '2Y' | '1Y' | '6M' | '3M' | 'name' | 'value'>('5Y');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // 初始化真实持仓变化数据
  useEffect(() => {
    // 比较今天的持仓和昨天的持仓，找出变化
    // 暂时使用空数组，等待真实数据
    setHoldingChanges([]);
  }, []);

  // Load data
  useEffect(() => {
    // holdingsData is already in Manager format, no need to parse
    setManagers(holdingsData as Manager[]);
    setFilteredManagers(holdingsData as Manager[]);
  }, []);

  // Filter managers
  useEffect(() => {
    if (searchTerm) {
      const filtered = managers.filter((m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.holdings.some(
          (h) =>
            h.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
            h.company.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredManagers(filtered);
    } else {
      setFilteredManagers(managers);
    }
  }, [searchTerm, managers]);

  const processedData = managers.length > 0 ? processData(managers) : null;

  // 缓存收益数据计算 - 只使用真实数据
  const managersWithReturns = useMemo(() => {
    return filteredManagers.map(manager => {
      const realData = performanceRealData.find((p: any) => p.name === manager.name);
      let return5Y, return2Y, return1Y, return6M, return3M, hasRealData;

      if (realData && realData.returns) {
        // 使用真实 OpenBB 数据
        return5Y = realData.returns['5Y'];
        return2Y = realData.returns['2Y'];
        return1Y = realData.returns['1Y'];
        return6M = realData.returns['6M'];
        return3M = realData.returns['3M'];
        hasRealData = true;
      } else {
        // 没有真实数据，标记为 null
        return5Y = null;
        return2Y = null;
        return1Y = null;
        return6M = null;
        return3M = null;
        hasRealData = false;
      }

      return { manager, return5Y, return2Y, return1Y, return6M, return3M, hasRealData };
    });
  }, [filteredManagers]);

  // 计算共同持股热度
  const stockPopularity = useMemo(() => {
    const stockMap = new Map<string, { count: number; companies: Set<string>; totalPercentage: number }>();

    filteredManagers.forEach(manager => {
      manager.holdings.forEach(holding => {
        if (!stockMap.has(holding.symbol)) {
          stockMap.set(holding.symbol, {
            count: 0,
            companies: new Set(),
            totalPercentage: 0
          });
        }
        const data = stockMap.get(holding.symbol)!;
        data.count++;
        data.companies.add(holding.company);
        data.totalPercentage += holding.percentage;
      });
    });

    // 转换为数组并排序
    return Array.from(stockMap.entries())
      .map(([symbol, data]) => ({
        symbol,
        count: data.count,
        companies: Array.from(data.companies),
        avgPercentage: data.totalPercentage / data.count
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredManagers]);

  // Mock timeline events
  const timelineEvents = [
    {
      date: new Date('2025-12-15'),
      manager: 'Bill Ackman',
      action: 'buy' as const,
      symbol: 'GOOGL',
      company: 'Alphabet Inc.',
    },
    {
      date: new Date('2025-12-18'),
      manager: 'Carl Icahn',
      action: 'sell' as const,
      symbol: 'TSLA',
      company: 'Tesla Inc.',
    },
    {
      date: new Date('2025-12-20'),
      manager: 'Bill Gates',
      action: 'buy' as const,
      symbol: 'MSFT',
      company: 'Microsoft Corp.',
    },
    {
      date: new Date('2026-01-02'),
      manager: 'Warren Buffett',
      action: 'buy' as const,
      symbol: 'AAPL',
      company: 'Apple Inc.',
    },
    {
      date: new Date('2026-01-05'),
      manager: 'Bill Ackman',
      action: 'sell' as const,
      symbol: 'META',
      company: 'Meta Platforms',
    },
  ];

  // Force graph data
  const forceNodes = [
    { id: 'Buffett', group: 'manager' },
    { id: 'Ackman', group: 'manager' },
    { id: 'Icahn', group: 'manager' },
    { id: 'Gates', group: 'manager' },
    { id: 'AAPL', group: 'stock', value: 15 },
    { id: 'GOOGL', group: 'stock', value: 12 },
    { id: 'MSFT', group: 'stock', value: 18 },
    { id: 'TSLA', group: 'stock', value: 8 },
    { id: 'Technology', group: 'industry' },
    { id: 'Finance', group: 'industry' },
  ];

  const forceLinks = [
    { source: 'Buffett', target: 'AAPL', value: 5 },
    { source: 'Buffett', target: 'Finance', value: 3 },
    { source: 'Ackman', target: 'GOOGL', value: 4 },
    { source: 'Ackman', target: 'Technology', value: 3 },
    { source: 'Icahn', target: 'TSLA', value: 2 },
    { source: 'Gates', target: 'MSFT', value: 5 },
    { source: 'Gates', target: 'Technology', value: 4 },
    { source: 'AAPL', target: 'Technology', value: 2 },
    { source: 'GOOGL', target: 'Technology', value: 2 },
    { source: 'MSFT', target: 'Technology', value: 2 },
  ];

  // Export data
  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(filteredManagers, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'holdings_data.json';
    a.click();
  }, [filteredManagers]);

  // 通知处理函数
  const handleMarkAllRead = useCallback(() => {
    setHoldingChanges((prev) => prev.map((c) => ({ ...c, read: true })));
  }, []);

  const handleMarkRead = useCallback((id: string) => {
    setHoldingChanges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, read: true } : c))
    );
  }, []);

  const handleDismiss = useCallback((id: string) => {
    setHoldingChanges((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold">
                  投资大佬持仓可视化仪表板
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  实时跟踪81位超级投资者的投资组合变化
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {wsConnected ? (
                    <Wifi className="w-5 h-5 text-green-500" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="text-sm">{wsConnected ? '实时更新' : '离线模式'}</span>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  设置
                </Button>
                <Button variant="outline" size="sm" onClick={exportData}>
                  <Download className="w-4 h-4 mr-2" />
                  导出
                </Button>
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  账户
                </Button>
                <NotificationPanel
                  changes={holdingChanges}
                  onMarkAllRead={handleMarkAllRead}
                  onMarkRead={handleMarkRead}
                  onDismiss={handleDismiss}
                />
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  刷新
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        {processedData && <DashboardHeader data={processedData} />}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="搜索投资者、股票代码或公司名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
                <Label htmlFor="notifications">实时通知</Label>
              </div>
              <Badge variant="outline">{filteredManagers.length} 位投资者</Badge>
            </div>
          </CardContent>
        </Card>

        {/* TradingView Ticker Tape */}
        <TradingViewTickerTape />

        {/* Main Content - 16:9 Layout */}
        <div className="aspect-video grid grid-cols-12 gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="col-span-12">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">总览</TabsTrigger>
              <TabsTrigger value="news">实时新闻</TabsTrigger>
              <TabsTrigger value="d3">D3.js图表</TabsTrigger>
              <TabsTrigger value="plotly">Plotly 3D</TabsTrigger>
              <TabsTrigger value="holdings">持仓详情</TabsTrigger>
              <TabsTrigger value="performanceranking">绩效分析</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>行业分布 (Top 10)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {processedData && (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={processedData.industryDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {processedData.industryDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>最受关注股票 (Top 10)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {processedData && (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={processedData.topHoldings.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="symbol" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" name="持有者数量" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* D3.js Tab */}
            <TabsContent value="d3" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <D3Timeline events={timelineEvents} />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <D3ForceGraph nodes={forceNodes} links={forceLinks} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Plotly Tab */}
            <TabsContent value="plotly" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>3D持仓分布</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {processedData && <Plotly3DChart data={processedData.topHoldings.slice(0, 20)} />}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>动画展示</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {processedData && <PlotlyAnimatedChart data={processedData.topHoldings} />}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Holdings Tab */}
            <TabsContent value="holdings">
              <div className="space-y-6">
                {/* 共同持股热度排行榜 */}
                <Card>
                  <CardHeader>
                    <CardTitle>🔥 共同持股热度排行榜（Top 20）</CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                      显示被最多投资大佬持有的股票 · 🔥 数量表示热度
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)', color: 'white' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>热度</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>股票代码</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>持有数量</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>平均占比</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stockPopularity.slice(0, 20).map((stock) => {
                            const getFireEmojis = (count: number) => {
                              if (count >= 20) return '🔥🔥🔥🔥🔥';
                              if (count >= 15) return '🔥🔥🔥🔥';
                              if (count >= 10) return '🔥🔥🔥';
                              if (count >= 5) return '🔥🔥';
                              if (count >= 3) return '🔥';
                              return '';
                            };
                            return (
                              <tr key={stock.symbol} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td style={{ padding: '12px', fontSize: '1.2em' }}>
                                  {getFireEmojis(stock.count)}
                                </td>
                                <td style={{ padding: '12px', fontWeight: '500' }}>
                                  <Badge variant="outline" style={{ fontWeight: 'bold' }}>{stock.symbol}</Badge>
                                </td>
                                <td style={{ padding: '12px', textAlign: 'center', color: '#666' }}>
                                  {stock.count} 位大佬
                                </td>
                                <td style={{ padding: '12px', textAlign: 'center', color: '#666' }}>
                                  {stock.avgPercentage.toFixed(2)}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* 全部投资大佬持仓详情 */}
                <div>
                  <h3 style={{ fontSize: '1.5em', fontWeight: 'bold', marginBottom: '20px', color: '#1f2937' }}>
                      📋 全部投资大佬持仓详情（{filteredManagers.length}位）
                    </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredManagers.map((manager) => (
                      <Card key={manager.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{manager.name}</CardTitle>
                          <p className="text-sm text-gray-600">
                            组合规模: {manager.portfolioValue} | {manager.stockCount}只股票
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {manager.holdings.map((holding) => {
                              const popularity = stockPopularity.find(s => s.symbol === holding.symbol);
                              const getFireEmojis = (count: number) => {
                                if (count >= 20) return '🔥🔥🔥🔥🔥';
                                if (count >= 15) return '🔥🔥🔥🔥';
                                if (count >= 10) return '🔥🔥🔥';
                                if (count >= 5) return '🔥🔥';
                                if (count >= 3) return '🔥';
                                return '';
                              };
                              return (
                                <div key={holding.symbol} className="flex justify-between items-center">
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <Badge variant="outline">{holding.symbol}</Badge>
                                      {popularity && (
                                        <span style={{ fontSize: '0.9em' }}>
                                          {getFireEmojis(popularity.count)}
                                        </span>
                                      )}
                                    </div>
                                    <span className="ml-2 text-sm text-gray-600" style={{ display: 'block', marginTop: '2px' }}>
                                      {holding.company}
                                    </span>
                                  </div>
                                  <span className="font-semibold" style={{ marginLeft: '8px' }}>
                                    {holding.percentage}%
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performanceranking" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>🏆 投资大佬组合收益排行榜（全部）</CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    点击列标题可排序 · 当前按 <strong>{sortBy === '5Y' ? '5年收益' : sortBy === '2Y' ? '2年收益' : sortBy === '1Y' ? '1年收益' : sortBy === '6M' ? '6月收益' : sortBy === '3M' ? '3月收益' : sortBy === 'name' ? '名称' : '规模'}</strong> {sortOrder === 'desc' ? '降序' : '升序'}
                  </p>
                </CardHeader>
                <CardContent>
                  <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
                      <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                        <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                          <th style={{ padding: '10px', textAlign: 'left' }}>排名</th>
                          <th
                            style={{ padding: '10px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                            onClick={() => { setSortBy('name'); setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc'); }}
                          >
                            投资大佬 {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th
                            style={{ padding: '10px', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                            onClick={() => { setSortBy('value'); setSortOrder(sortBy === 'value' && sortOrder === 'asc' ? 'desc' : 'asc'); }}
                          >
                            规模 {sortBy === 'value' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th style={{ padding: '10px', textAlign: 'right' }}>持仓数</th>
                          <th
                            style={{ padding: '10px', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                            onClick={() => { setSortBy('5Y'); setSortOrder(sortBy === '5Y' && sortOrder === 'asc' ? 'desc' : 'asc'); }}
                          >
                            5年收益 {sortBy === '5Y' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th
                            style={{ padding: '10px', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                            onClick={() => { setSortBy('2Y'); setSortOrder(sortBy === '2Y' && sortOrder === 'asc' ? 'desc' : 'asc'); }}
                          >
                            2年收益 {sortBy === '2Y' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th
                            style={{ padding: '10px', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                            onClick={() => { setSortBy('1Y'); setSortOrder(sortBy === '1Y' && sortOrder === 'asc' ? 'desc' : 'asc'); }}
                          >
                            1年收益 {sortBy === '1Y' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th
                            style={{ padding: '10px', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                            onClick={() => { setSortBy('6M'); setSortOrder(sortBy === '6M' && sortOrder === 'asc' ? 'desc' : 'asc'); }}
                          >
                            6月收益 {sortBy === '6M' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th
                            style={{ padding: '10px', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                            onClick={() => { setSortBy('3M'); setSortOrder(sortBy === '3M' && sortOrder === 'asc' ? 'desc' : 'asc'); }}
                          >
                            3月收益 {sortBy === '3M' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          // 根据选择的列和顺序排序
                          const sorted = [...managersWithReturns].sort((a, b) => {
                            // 没有真实数据的排在最后
                            if (!a.hasRealData && b.hasRealData) return 1;
                            if (a.hasRealData && !b.hasRealData) return -1;
                            if (!a.hasRealData && !b.hasRealData) return 0;

                            let compareA, compareB;

                            switch (sortBy) {
                              case '5Y':
                                compareA = a.return5Y!;
                                compareB = b.return5Y!;
                                break;
                              case '2Y':
                                compareA = a.return2Y!;
                                compareB = b.return2Y!;
                                break;
                              case '1Y':
                                compareA = a.return1Y!;
                                compareB = b.return1Y!;
                                break;
                              case '6M':
                                compareA = a.return6M!;
                                compareB = b.return6M!;
                                break;
                              case '3M':
                                compareA = a.return3M!;
                                compareB = b.return3M!;
                                break;
                              case 'name':
                                compareA = a.manager.name.toLowerCase();
                                compareB = b.manager.name.toLowerCase();
                                break;
                              case 'value':
                                const parseValue = (str: string) => {
                                  const num = parseFloat(str.replace('$', '').replace('B', '').replace('M', ''));
                                  const isB = str.includes('B');
                                  return isB ? num * 1000 : num;
                                };
                                compareA = parseValue(a.manager.portfolioValue);
                                compareB = parseValue(b.manager.portfolioValue);
                                break;
                              default:
                                compareA = a.return5Y!;
                                compareB = b.return5Y!;
                            }

                            if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
                            if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
                            return 0;
                          });

                          return sorted.map(({ manager, return5Y, return2Y, return1Y, return6M, return3M, hasRealData }, index) => {
                            const formatReturn = (val: number | null) => val === null ? '暂无数据' : `${val.toFixed(2)}%`;
                            const getReturnColor = (val: number | null) => {
                              if (val === null) return '#9ca3af';
                              return val > 0 ? '#16a34a' : val < 0 ? '#dc2626' : '#6b7280';
                            };
                            const getTrendIcon = (val: number | null) => {
                              if (val === null) return '';
                              return val > 0 ? '📈' : val < 0 ? '📉' : '➖';
                            };

                            return (
                              <tr key={manager.id} style={{ borderBottom: '1px solid #f0f0f0', background: !hasRealData ? '#f9fafb' : undefined }}>
                                <td style={{ padding: '10px' }}>
                                  <strong>#{index + 1}</strong>
                                  {index === 0 && hasRealData && ' 🥇'}
                                  {index === 1 && hasRealData && ' 🥈'}
                                  {index === 2 && hasRealData && ' 🥉'}
                                </td>
                                <td style={{ padding: '10px', fontWeight: '500' }}>
                                  {manager.name}
                                  {hasRealData && (
                                    <span style={{ marginLeft: '6px', fontSize: '0.75em', color: '#16a34a', fontWeight: 'bold' }}>
                                      ✓ OpenBB真实数据
                                    </span>
                                  )}
                                  {!hasRealData && (
                                    <span style={{ marginLeft: '6px', fontSize: '0.75em', color: '#9ca3af' }}>
                                      等待计算
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: '10px', textAlign: 'right', fontWeight: '500' }}>
                                  {manager.portfolioValue}
                                </td>
                                <td style={{ padding: '10px', textAlign: 'right', color: '#666' }}>
                                  {manager.stockCount}只
                                </td>
                                <td style={{ padding: '10px', textAlign: 'right', color: getReturnColor(return5Y), fontWeight: 'bold' }}>
                                  {formatReturn(return5Y)} {getTrendIcon(return5Y)}
                                </td>
                                <td style={{ padding: '10px', textAlign: 'right', color: getReturnColor(return2Y) }}>
                                  {formatReturn(return2Y)}
                                </td>
                                <td style={{ padding: '10px', textAlign: 'right', color: getReturnColor(return1Y) }}>
                                  {formatReturn(return1Y)}
                                </td>
                                <td style={{ padding: '10px', textAlign: 'right', color: getReturnColor(return6M) }}>
                                  {formatReturn(return6M)}
                                </td>
                                <td style={{ padding: '10px', textAlign: 'right', color: getReturnColor(return3M) }}>
                                  {formatReturn(return3M)}
                                </td>
                              </tr>
                            );
                          });
                        })()}
                    </tbody>
                    </table>
                  </div>
                  <div style={{ marginTop: '20px', padding: '15px', background: '#f0f9ff', border: '2px solid #0ea5e9', borderRadius: '8px' }}>
                    <p style={{ color: '#075985', fontSize: '0.9em', margin: 0 }}>
                      💡 <strong>数据说明</strong>: 标有"✓ OpenBB真实数据"的投资组合使用 OpenBB 从实际历史价格计算收益率。
                      其他投资组合的收益率正在计算中，请稍后刷新。系统每天北京时间上午10点自动抓取最新持仓数据并计算收益率。
                      <strong>不使用任何模拟数据</strong> - 所有收益率均基于真实市场价格。
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* News Tab */}
            <TabsContent value="news" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <NewsTicker finnhubApiKey={API_CONFIG.finnhubApiKey} />
                <TradingViewWidget />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <Card className="mt-6">
          <CardContent className="p-4 text-center text-sm text-gray-600">
            <p>
              数据来源: DATAROMA | TradingView | Finnhub API | 更新时间: {new Date().toLocaleString('zh-CN')}
            </p>
            <p className="mt-1">
              支持的可视化: D3.js (时间线、力导向图) | Plotly (3D、动画) | Recharts (常规图表) | 实时新闻 (TradingView + Finnhub)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
