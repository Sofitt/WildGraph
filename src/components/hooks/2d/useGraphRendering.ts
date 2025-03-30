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
) {
  useEffect(() => {
    if (!svgRef.current || !simulationRef.current) return

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height)

    // Очистка существующих элементов
    svg.selectAll('*').remove()

    // Создание элементов связей
    const linkElements = svg
      .selectAll('.link')
      .data(graphData.links)
      .enter()
      .append('line')
      .attr('class', 'link')

    // Создание элементов узлов
    const nodeElements = svg
      .selectAll('.node')
      .data(graphData.nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', (d) => d.size)
      .attr('fill', (d) => d.color)

    // Создание текстовых меток
    const textElements = svg
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

    // Функции для hover
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

    // Добавление обработчиков событий
    nodeElements
      // @ts-ignore
      .call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended))
      .on('mouseover', mouseOver)
      .on('mouseout', mouseOut)
      // @ts-ignore
      .on('click', (event, d) => setEditNode(d), [])

    // Установка функции tick для симуляции
    simulationRef.current.on('tick', ticked)
    simulationRef.current.on('end', ticked)
    simulationRef.current.alpha(1).restart()

    return () => {
      // Очистка при размонтировании
      simulationRef.current!.on('tick', null)
    }
  }, [svgRef, simulationRef, graphData, width, height, setEditNode, saveData])
}
