import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface TimelineEvent {
  date: Date;
  manager: string;
  action: 'buy' | 'sell';
  symbol: string;
  company: string;
}

interface D3TimelineProps {
  events: TimelineEvent[];
}

export function D3Timeline({ events }: D3TimelineProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || events.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 150 };

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(events, (d) => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleBand()
      .domain(Array.from(new Set(events.map((d) => d.manager))))
      .range([margin.top, height - margin.bottom])
      .padding(0.2);

    // Create main group
    const g = svg.append('g');

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .attr('color', '#64748b');

    // Add Y axis
    g.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))
      .attr('color', '#64748b');

    // Add events
    events.forEach((event) => {
      const y = yScale(event.manager);
      const x = xScale(event.date);

      if (y && x) {
        // Circle
        g.append('circle')
          .attr('cx', x)
          .attr('cy', y! + yScale.bandwidth() / 2)
          .attr('r', 6)
          .attr('fill', event.action === 'buy' ? '#10b981' : '#ef4444')
          .attr('opacity', 0.8)
          .style('cursor', 'pointer')
          .append('title')
          .text(
            `${event.manager}\n${event.action.toUpperCase()}: ${event.symbol}\n${event.company}\n${event.date.toLocaleDateString()}`
          );

        // Line to axis
        g.append('line')
          .attr('x1', x)
          .attr('y1', y! + yScale.bandwidth() / 2)
          .attr('x2', x)
          .attr('y2', height - margin.bottom)
          .attr('stroke', event.action === 'buy' ? '#10b981' : '#ef4444')
          .attr('stroke-width', 1)
          .attr('opacity', 0.3)
          .attr('stroke-dasharray', '4,4');
      }
    });

    // Add legend
    const legend = svg
      .append('g')
      .attr('transform', `translate(${width - 150}, 30)`);

    legend
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 6)
      .attr('fill', '#10b981');

    legend
      .append('text')
      .attr('x', 15)
      .attr('y', 4)
      .text('买入')
      .attr('font-size', '12px')
      .attr('fill', '#374151');

    legend
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 20)
      .attr('r', 6)
      .attr('fill', '#ef4444');

    legend
      .append('text')
      .attr('x', 15)
      .attr('y', 24)
      .text('卖出')
      .attr('font-size', '12px')
      .attr('fill', '#374151');
  }, [events]);

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">持仓变化时间线</h3>
      <svg ref={svgRef} width="100%" height={400} className="border rounded-lg bg-white" />
    </div>
  );
}
