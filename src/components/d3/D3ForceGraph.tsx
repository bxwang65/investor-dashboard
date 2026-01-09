import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node {
  id: string;
  group: string;
  value?: number;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

interface D3ForceGraphProps {
  nodes: Node[];
  links: Link[];
}

export function D3ForceGraph({ nodes, links }: D3ForceGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = 500;

    // Color scale
    const colorScale = d3
      .scaleOrdinal()
      .domain(['manager', 'stock', 'industry'])
      .range(['#3b82f6', '#10b981', '#f59e0b']);

    // Create simulation
    const simulation = d3
      .forceSimulation(nodes as d3.SimulationNodeDatum)
      .force(
        'link',
        d3
          .forceLink(links as d3.SimulationLinkDatum<d3.SimulationNodeDatum>)
          .id((d: any) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Create main group
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 4]).on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

    svg.call(zoom as any);

    // Add links
    const link = g
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d) => Math.sqrt(d.value) * 2);

    // Add nodes
    const node = g
      .append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d) => 10 + (d.value || 0) / 10)
      .attr('fill', (d) => colorScale(d.group as string) as string)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(
        d3
          .drag<SVGCircleElement, unknown>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended) as any
      );

    // Add labels
    const label = g
      .append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text((d) => d.id)
      .attr('font-size', '10px')
      .attr('font-family', 'sans-serif')
      .attr('text-anchor', 'middle')
      .attr('dy', -15)
      .attr('fill', '#374151')
      .style('pointer-events', 'none');

    // Add tooltips
    node.append('title').text((d: any) => `${d.id}\n${d.group}`);

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);

      label.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y);
    });

    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, unknown, d3.SimulationNodeDatum>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, unknown, d3.SimulationNodeDatum>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGCircleElement, unknown, d3.SimulationNodeDatum>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
  }, [nodes, links]);

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">投资者关系网络图</h3>
      <div className="text-sm text-gray-600 mb-2">
        蓝色=投资者 | 绿色=股票 | 橙色=行业
      </div>
      <svg ref={svgRef} width="100%" height={500} className="border rounded-lg bg-white" />
    </div>
  );
}
