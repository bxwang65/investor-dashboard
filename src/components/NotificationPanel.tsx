import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, X, Check, TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HoldingChange {
  id: string;
  managerName: string;
  symbol: string;
  company: string;
  type: 'new' | 'removed' | 'increased' | 'decreased';
  oldValue?: string;
  newValue?: string;
  timestamp: number;
  read: boolean;
}

interface NotificationPanelProps {
  changes: HoldingChange[];
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function NotificationPanel({
  changes,
  onMarkAllRead,
  onMarkRead,
  onDismiss,
}: NotificationPanelProps) {
  const unreadCount = changes.filter((c) => !c.read).length;

  const getChangeIcon = (type: HoldingChange['type']) => {
    switch (type) {
      case 'new':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'removed':
        return <Minus className="w-4 h-4 text-red-500" />;
      case 'increased':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decreased':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
  };

  const getChangeText = (type: HoldingChange['type']) => {
    switch (type) {
      case 'new':
        return '新买入';
      case 'removed':
        return '已清仓';
      case 'increased':
        return '增持';
      case 'decreased':
        return '减持';
    }
  };

  const getChangeBadgeColor = (type: HoldingChange['type']) => {
    switch (type) {
      case 'new':
        return 'bg-green-100 text-green-800';
      case 'removed':
        return 'bg-red-100 text-red-800';
      case 'increased':
        return 'bg-green-100 text-green-800';
      case 'decreased':
        return 'bg-orange-100 text-orange-800';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    return `${Math.floor(diff / 86400)}天前`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span>持仓变化通知</span>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={onMarkAllRead}
            >
              全部已读
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[500px] overflow-y-auto">
          {changes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>暂无持仓变化通知</p>
              <p className="text-xs mt-1">有大佬调仓时会第一时间提醒</p>
            </div>
          ) : (
            changes.map((change) => (
              <DropdownMenuItem
                key={change.id}
                className="flex flex-col items-start p-3 gap-2"
                onClick={() => onMarkRead(change.id)}
              >
                <div className="flex items-start gap-2 w-full">
                  {getChangeIcon(change.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{change.managerName}</span>
                      <Badge className={`text-xs ${getChangeBadgeColor(change.type)}`}>
                        {getChangeText(change.type)}
                      </Badge>
                      {!change.read && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">{change.symbol}</span>
                      <span className="text-gray-600 ml-1">{change.company}</span>
                    </div>
                    {(change.oldValue || change.newValue) && (
                      <div className="text-xs text-gray-500 mt-1">
                        {change.oldValue && <span>从 {change.oldValue} </span>}
                        {change.newValue && <span>→ {change.newValue}</span>}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {formatTimestamp(change.timestamp)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismiss(change.id);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
        {changes.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center text-sm text-gray-600 cursor-pointer"
              onClick={onMarkAllRead}
            >
              点击查看全部变化详情
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// 生成模拟持仓变化数据
export function generateMockChanges(): HoldingChange[] {
  return [
    {
      id: '1',
      managerName: 'Warren Buffett',
      symbol: 'AAPL',
      company: 'Apple Inc.',
      type: 'increased',
      oldValue: '4.5%',
      newValue: '5.2%',
      timestamp: Date.now() / 1000 - 300, // 5分钟前
      read: false,
    },
    {
      id: '2',
      managerName: 'Bill Ackman',
      symbol: 'GOOGL',
      company: 'Alphabet Inc.',
      type: 'new',
      newValue: '3.2%',
      timestamp: Date.now() / 1000 - 1800, // 30分钟前
      read: false,
    },
    {
      id: '3',
      managerName: 'Carl Icahn',
      symbol: 'TSLA',
      company: 'Tesla Inc.',
      type: 'decreased',
      oldValue: '8.5%',
      newValue: '6.2%',
      timestamp: Date.now() / 1000 - 3600, // 1小时前
      read: false,
    },
    {
      id: '4',
      managerName: 'Bill Gates',
      symbol: 'MSFT',
      company: 'Microsoft Corp.',
      type: 'increased',
      oldValue: '12.5%',
      newValue: '13.8%',
      timestamp: Date.now() / 1000 - 7200, // 2小时前
      read: true,
    },
    {
      id: '5',
      managerName: 'George Soros',
      symbol: 'NVDA',
      company: 'NVIDIA Corp.',
      type: 'removed',
      oldValue: '5.1%',
      timestamp: Date.now() / 1000 - 10800, // 3小时前
      read: true,
    },
  ];
}
