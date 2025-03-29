import { type FC, useRef } from 'react'
import { type UseGraphData } from './2d/useGraphData'
import { useGraphSimulation } from './2d/useGraphSimulation'
import { useGraphRendering } from './2d/useGraphRendering'
import { type NodeType } from './types/graph'

type Props = {
  onEditNode: (node: NodeType | null) => void
  graphUse: UseGraphData
}

const Graph2D: FC<Props> = ({ onEditNode, graphUse }) => {
  const width = 800
  const height = 600

  const svgRef = useRef<SVGSVGElement>(null)

  const { graphData, saveData } = graphUse

  const simulationRef = useGraphSimulation(graphData, width, height)

  const handleEditNode = (node: NodeType | null) => {
    onEditNode(node)
  }

  useGraphRendering(svgRef, simulationRef, graphData, width, height, handleEditNode, saveData)

  return <svg ref={svgRef}></svg>
}

export default Graph2D
