import { useEffect, RefObject, useRef } from 'react'
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
  onNodeHover?: (node: NodeType | null, event?: MouseEvent) => void,
  externalZoomTransformRef?: React.MutableRefObject<d3.ZoomTransform | null>,
) {
  const localZoomTransformRef = useRef<d3.ZoomTransform | null>(null)
  const zoomTransformRef = externalZoomTransformRef || localZoomTransformRef

  const setEditNodeRef = useRef(setEditNode)
  const saveDataRef = useRef(saveData)
  const onNodeHoverRef = useRef(onNodeHover)

  useEffect(() => {
    setEditNodeRef.current = setEditNode
    saveDataRef.current = saveData
    onNodeHoverRef.current = onNodeHover
  })

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height)

    const onResize = () => {
      const newWidth = window.innerWidth
      const newHeight = window.innerHeight
      d3.select(svgRef.current).attr('width', newWidth).attr('height', newHeight)
      // НЕ трогаем transform группы - это управляется зумом
    }

    window.addEventListener('resize', onResize)

    let group = svg.select<SVGGElement>('g#graphGroup')
    if (group.empty()) {
      group = svg.append('g').attr('id', 'graphGroup')
    }

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [width, height])

  useEffect(() => {
    if (!svgRef.current || !simulationRef.current) return

    const svg = d3.select(svgRef.current)
    let group = svg.select<SVGGElement>('g#graphGroup')

    // Очищаем только при изменении данных графа
    group.selectAll('*').remove()

    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 4]) // можно настроить минимальный и максимальный зум
      .on('zoom', (event) => {
        group.attr('transform', event.transform)
        // Сохраняем текущую трансформацию
        zoomTransformRef.current = event.transform
      })

    // @ts-ignore
    svg.call(zoom)

    // Восстанавливаем сохраненную трансформацию при инициализации
    if (zoomTransformRef.current) {
      requestAnimationFrame(() => {
        if (zoomTransformRef.current) {
          // @ts-ignore
          svg.call(zoom.transform, zoomTransformRef.current)
        }
      })
    }

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
        .attr('x1', (d) => d.source.x || 0)
        .attr('y1', (d) => d.source.y || 0)
        .attr('x2', (d) => d.target.x || 0)
        .attr('y2', (d) => d.target.y || 0)

      nodeElements
        .attr('cx', (d) => d.x || 0)
        .attr('cy', (d) => d.y || 0)

      textElements.attr('x', (d) => d.x || 0).attr('y', (d) => (d.y || 0) + 10)
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
      saveDataRef.current()
    }

    const mouseOver = (event: any, d: NodeType) => {
      // @ts-ignore
      nodeElements.classed(
        'highlight',
        (o) => (d.join && d.join.find((j) => j.name === o.name)) || o.name === d.name,
      )

      linkElements.classed('highlight', (o) => o.source.name === d.name || o.target.name === d.name)

      if (onNodeHoverRef.current) {
        let mouseEvent = undefined

        if (
          event.sourceEvent &&
          event.sourceEvent.clientX !== undefined &&
          event.sourceEvent.clientY !== undefined
        ) {
          mouseEvent = {
            clientX: event.sourceEvent.clientX,
            clientY: event.sourceEvent.clientY,
          }
        } else {
          const svgRect = svgRef.current?.getBoundingClientRect()
          if (svgRect && d.x !== undefined && d.y !== undefined) {
            mouseEvent = {
              clientX: svgRect.left + d.x,
              clientY: svgRect.top + d.y,
            }
          }
        }

        onNodeHoverRef.current(d, mouseEvent)
      }
    }

    const mouseOut = () => {
      nodeElements.classed('highlight', false)
      linkElements.classed('highlight', false)

      if (onNodeHoverRef.current) {
        onNodeHoverRef.current(null)
      }
    }

    nodeElements
      // @ts-ignore
      .call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended))
      .on('mouseover', mouseOver)
      .on('mouseout', mouseOut)
      .on('click', (_, d) => setEditNodeRef.current(d))

    simulationRef.current.on('tick', ticked)
    simulationRef.current.on('end', ticked)
    simulationRef.current.alpha(1).restart()

    // НЕ восстанавливаем зум при каждом обновлении данных - только при инициализации

    return () => {
      simulationRef.current!.on('tick', null)
    }
  }, [graphData])

  // Отдельный useEffect для синхронизации D3 элементов с симуляцией при изменении размеров
  useEffect(() => {
    if (!svgRef.current || !simulationRef.current) return

    const svg = d3.select(svgRef.current)
    const group = svg.select<SVGGElement>('g#graphGroup')

    if (group.empty()) return

    const nodeElements = group.selectAll('.node')
    const linkElements = group.selectAll('.link')
    const textElements = group.selectAll('.nodelabel')

    // Переподключаем drag к нодам после изменения размеров
    if (!nodeElements.empty()) {
      const dragstarted = (event: any, d: any) => {
        if (!event.active) simulationRef.current!.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      }

      const dragged = (event: any, d: any) => {
        d.fx = event.x
        d.fy = event.y
      }

      const dragended = (event: any, d: any) => {
        if (!event.active) simulationRef.current!.alphaTarget(0)
        d.fx = null
        d.fy = null
        saveDataRef.current()
      }

      // Переподключаем drag обработчики
      nodeElements
        // @ts-ignore
        .call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended))
    }

    // Обновляем tick функцию для новой симуляции
    const ticked = () => {
      linkElements
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      nodeElements.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y)

      textElements.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y + 10)
    }

    simulationRef.current.on('tick', ticked)
    simulationRef.current.on('end', ticked)
  }, [width, height])

  // Отдельный useEffect для обработки поиска (НЕ сбрасываем зум-трансформацию):
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const group = svg.select('g#graphGroup')

    // Если нет поискового запроса, НЕ сбрасываем трансформацию (сохраняем зум)
    if (!searchQuery || (Array.isArray(searchQuery) && searchQuery.length === 0)) {
      return
    }

    const queries = (Array.isArray(searchQuery) ? searchQuery : [searchQuery]).map((q) =>
      q.toLowerCase(),
    )
    const targetNode = graphData.nodes.find((n) =>
      queries.every((q) => n.family.some((f) => f.toLowerCase().includes(q))),
    )

    if (targetNode) {
      // Применяем поисковую трансформацию поверх текущего зума
      const currentTransform = zoomTransformRef.current || d3.zoomIdentity
      const searchTransform = d3.zoomIdentity.translate(
        width / 2 - targetNode.x,
        height / 2 - targetNode.y,
      )

      // Комбинируем зум и поисковую трансформацию
      const combinedTransform = currentTransform.translate(
        searchTransform.x / currentTransform.k,
        searchTransform.y / currentTransform.k,
      )

      group.attr('transform', combinedTransform.toString())
    }
  }, [searchQuery, graphData, width, height])
}
