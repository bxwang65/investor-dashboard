import { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

interface Plotly3DChartProps {
  data: Array<{
    symbol: string;
    count: number;
    avgPercentage: number;
  }>;
}

export function Plotly3DChart({ data }: Plotly3DChartProps) {
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!plotRef.current || data.length === 0) return;

    const symbols = data.map((d) => d.symbol);
    const counts = data.map((d) => d.count);
    const percentages = data.map((d) => d.avgPercentage);

    const trace: Plotly.Data = {
      type: 'scatter3d',
      mode: 'markers',
      x: symbols,
      y: counts,
      z: percentages,
      marker: {
        size: counts.map((c) => c * 3),
        color: percentages,
        colorscale: 'Viridis',
        opacity: 0.8,
        colorbar: {
          title: '平均持仓比例',
        },
      },
      text: symbols.map(
        (s, i) =>
          `${s}<br>持有者: ${counts[i]}<br>平均比例: ${percentages[i].toFixed(2)}%`
      ),
      hoverinfo: 'text',
    };

    const layout: Partial<Plotly.Layout> = {
      title: '持仓分布3D可视化',
      margin: { l: 0, r: 0, b: 0, t: 30 },
      scene: {
        xaxis: { title: '股票代码' },
        yaxis: { title: '持有者数量' },
        zaxis: { title: '平均比例(%)' },
      },
      font: {
        family: 'Arial, sans-serif',
      },
    };

    const config: Plotly.Config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    };

    Plotly.newPlot(plotRef.current, [trace], layout, config);

    return () => {
      Plotly.purge(plotRef.current);
    };
  }, [data]);

  return <div ref={plotRef} className="w-full h-[500px] border rounded-lg bg-white" />;
}

export function PlotlyAnimatedChart({ data }: Plotly3DChartProps) {
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!plotRef.current || data.length === 0) return;

    const frames = data.slice(0, 10).map((_, i) => ({
      name: `frame${i}`,
      data: [
        {
          type: 'bar',
          x: data.slice(0, i + 1).map((d) => d.symbol),
          y: data.slice(0, i + 1).map((d) => d.count),
          marker: {
            color: data.slice(0, i + 1).map((d) => d.avgPercentage),
            colorscale: 'RdYlGn',
          },
        },
      ],
    }));

    const plotData: Plotly.Data[] = [
      {
        type: 'bar',
        x: [data[0].symbol],
        y: [data[0].count],
        marker: {
          color: [data[0].avgPercentage],
          colorscale: 'RdYlGn',
        },
      },
    ];

    const layout: Partial<Plotly.Layout> = {
      title: '持仓排名动画展示',
      xaxis: { title: '股票代码' },
      yaxis: { title: '持有者数量' },
      updatemenus: [
        {
          type: 'buttons',
          showactive: false,
          buttons: [
            {
              label: '播放',
              method: 'animate',
              args: [null, { frame: { duration: 500, redraw: true }, fromcurrent: true }],
            },
            {
              label: '重置',
              method: 'animate',
              args: [[null], { frame: { duration: 0, redraw: true }, mode: 'immediate' }],
            },
          ],
        },
      ],
      sliders: [
        {
          pad: { t: 50 },
          steps: frames.map((frame, i) => ({
            label: `#${i + 1}`,
            method: 'animate',
            args: [[frame.name], { frame: { duration: 0, redraw: true }, mode: 'immediate' }],
          })),
        },
      ],
    };

    const config: Plotly.Config = {
      responsive: true,
      displayModeBar: true,
    };

    Plotly.newPlot(plotRef.current, plotData, layout, config);

    return () => {
      Plotly.purge(plotRef.current);
    };
  }, [data]);

  return <div ref={plotRef} className="w-full h-[500px] border rounded-lg bg-white" />;
}
