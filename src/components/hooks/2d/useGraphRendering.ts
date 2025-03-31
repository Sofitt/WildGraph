import { useEffect, RefObject } from 'react'
import * as d3 from 'd3'
import { GraphData, NodeType } from '../../types/graph.ts'

export function useGraphRendering(
  svgRef: RefObject<SVGSVGElement | null>,
  simulationRef: RefObject<d3.Simulation<any, undefined> | null>,
  graphData: GraphData,
  width: number,
  height: number,
  setEditNode: (node: NodeType | null) => void,
  saveData: (data?: GraphData) => void,
  searchQuery: string[],
) {
  useEffect(() => {
    if (!svgRef.current || !simulationRef.current) return

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height)

    const onResize = () => {
      const newWidth = window.innerWidth
      const newHeight = window.innerHeight
      d3.select(svgRef.current).attr('width', newWidth).attr('height', newHeight)
      const group = svgRef.current?.querySelector('g#graphGroup') as SVGGElement
      if (group) {
        // центрирование
        const translateX = (newWidth - width) / 2
        const translateY = (newHeight - height) / 2
        group.setAttribute('transform', `translate(${translateX}, ${translateY})`)
      }
    }

    window.addEventListener('resize', onResize)

    let group = svg.select<SVGGElement>('g#graphGroup')
    if (group.empty()) {
      group = svg.append('g').attr('id', 'graphGroup')
    } else {
      group.selectAll('*').remove()
    }

    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 4]) // можно настроить минимальный и максимальный зум
      .on('zoom', (event) => {
        group.attr('transform', event.transform)
      })
    // @ts-ignore
    svg.call(zoom)

    // Создание элементов связей
    const linkElements = group
      .selectAll('.link')
      .data(graphData.links)
      .enter()
      .append('line')
      .attr('class', 'link')

    // Создание элементов узлов
    const nodeElements = group
      .selectAll('.node')
      .data(graphData.nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', (d) => d.size)
      .attr('fill', (d) => d.color)

    // Создание текстовых меток
    const textElements = group
      .selectAll('.nodelabel')
      .data(graphData.nodes)
      .enter()
      .append('text')
      .attr('class', 'nodelabel')
      .attr('data-is-node-label', 'true')
      .attr('dy', (d) => d.size + 4)
      .attr('text-anchor', 'middle')
      .text((d) => d.name)

    // Функция обновления позиций элементов
    const ticked = () => {
      linkElements
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)

      nodeElements.attr('cx', (d) => d.x).attr('cy', (d) => d.y)

      textElements.attr('x', (d) => d.x).attr('y', (d) => d.y + 10)
    }

    // Функции для drag & drop
    const dragstarted = (event: any, d: NodeType) => {
      if (!event.active) simulationRef.current!.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    const dragged = (event: any, d: NodeType) => {
      d.fx = event.x
      d.fy = event.y
    }

    const dragended = (event: any, d: NodeType) => {
      if (!event.active) simulationRef.current!.alphaTarget(0)
      d.fx = null
      d.fy = null
      saveData()
    }

    const mouseOver = (_: any, d: NodeType) => {
      // @ts-ignore
      nodeElements.classed(
        'highlight',
        (o) => (d.join && d.join.find((j) => j.name === o.name)) || o.name === d.name,
      )

      linkElements.classed('highlight', (o) => o.source.name === d.name || o.target.name === d.name)
    }

    const mouseOut = () => {
      nodeElements.classed('highlight', false)
      linkElements.classed('highlight', false)
    }

    nodeElements
      // @ts-ignore
      .call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended))
      .on('mouseover', mouseOver)
      .on('mouseout', mouseOut)
      .on('click', (_, d) => setEditNode(d))

    simulationRef.current.on('tick', ticked)
    simulationRef.current.on('end', ticked)
    simulationRef.current.alpha(1).restart()

    return () => {
      window.removeEventListener('resize', onResize)
      simulationRef.current!.on('tick', null)
    }
  }, [svgRef, simulationRef, graphData, width, height, setEditNode, saveData])

  // Отдельный useEffect для обработки поиска и сброса трансформации группы:
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const group = svg.select('g#graphGroup')
    // Если нет поискового запроса, сбрасываем трансформацию
    if (!searchQuery || (Array.isArray(searchQuery) && searchQuery.length === 0)) {
      group.attr('transform', '')
      return
    }

    const queries = (Array.isArray(searchQuery) ? searchQuery : [searchQuery]).map((q) =>
      q.toLowerCase(),
    )
    const targetNode = graphData.nodes.find((n) =>
      queries.every((q) => n.family.some((f) => f.toLowerCase().includes(q))),
    )

    if (targetNode) {
      const translateX = width / 2 - targetNode.x
      const translateY = height / 2 - targetNode.y
      group.attr('transform', `translate(${translateX}, ${translateY})`)
    } else {
      group.attr('transform', '')
    }
  }, [svgRef, simulationRef, graphData, width, height, setEditNode, saveData])
}
