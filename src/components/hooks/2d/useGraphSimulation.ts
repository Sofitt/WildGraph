import { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { GraphData } from '../../types/graph.ts'

export function useGraphSimulation(graphData: GraphData, width: number, height: number) {
  const simulationRef = useRef<d3.Simulation<any, undefined>>(null)

  // начиная с этой строки: функция для расчёта z координат
  function calculateZCoordinates(nodes: GraphData['nodes'], depth: number = 500): void {
    const maxJoin = Math.max(...nodes.map((d) => d.joinLength ?? 0)) || 1
    nodes.forEach((d) => {
      const join = d.joinLength ?? 0
      d.z = (join / maxJoin) * depth - depth / 2
    })
  }

  useEffect(() => {
    const repulsionInput = document.getElementById('repulsionRange') as HTMLInputElement
    let repulsionStrength = -120 // +repulsionInput.value

    calculateZCoordinates(graphData.nodes)
    // Создание симуляции
    simulationRef.current = d3
      .forceSimulation(graphData.nodes)
      .force(
        'charge',
        d3.forceManyBody().strength((d) => {
          // TODO Завязаться за join. Но он пока пустой
          console.log('dd', d)
          // @ts-ignore
          return (d.joinLength + 10) * -20
          // return repulsionStrength - d.joinLength
        }),
      )
      .force(
        'link',
        d3
          .forceLink(graphData.links)
          .id((d: any) => d.name)
          // .distance((d) => 100 + d.source.size * 5)
          .distance((d) => {
            // console.log('d', d)
            return 100 + d.source.joinLength * 5
          })
          .iterations(10),
      )
      .force('center', d3.forceCenter(width / 2, height / 2))

    // Обработчик изменения силы отталкивания
    const handleRepulsionChange = () => {
      repulsionStrength = +repulsionInput.value
      // @ts-ignore
      simulationRef.current!.force('charge')!.strength(repulsionStrength)
      simulationRef.current!.alpha(1).restart()
    }

    repulsionInput.addEventListener('input', handleRepulsionChange)

    return () => {
      repulsionInput.removeEventListener('input', handleRepulsionChange)
      simulationRef.current!.stop()
    }
  }, [width, height])

  // Обновление симуляции при изменении данных
  useEffect(() => {
    if (!simulationRef.current) return
    calculateZCoordinates(graphData.nodes)
    simulationRef.current.nodes(graphData.nodes)

    const linkForce = simulationRef.current.force('link') as d3.ForceLink<any, any>
    if (linkForce) {
      linkForce.links(graphData.links)
    }

    simulationRef.current.alpha(1).restart()
  }, [graphData])

  return simulationRef
}
