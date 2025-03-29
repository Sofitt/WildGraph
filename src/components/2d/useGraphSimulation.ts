import { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { GraphData } from '../types/graph'

export function useGraphSimulation(graphData: GraphData, width: number, height: number) {
  const simulationRef = useRef<d3.Simulation<any, undefined>>(null)

  useEffect(() => {
    const repulsionInput = document.getElementById('repulsionRange') as HTMLInputElement
    let repulsionStrength = +repulsionInput.value

    // Создание симуляции
    simulationRef.current = d3
      .forceSimulation(graphData.nodes)
      .force('charge', d3.forceManyBody().strength(repulsionStrength))
      .force(
        'link',
        d3
          .forceLink(graphData.links)
          .id((d: any) => d.name)
          .distance(100),
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

    simulationRef.current.nodes(graphData.nodes)

    const linkForce = simulationRef.current.force('link') as d3.ForceLink<any, any>
    if (linkForce) {
      linkForce.links(graphData.links)
    }

    simulationRef.current.alpha(1).restart()
  }, [graphData])

  return simulationRef
}
