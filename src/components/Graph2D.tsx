import { type FC, useRef } from 'react'
import { type UseGraphData } from '@/components/hooks/main/useGraphData.ts'
import { useGraphSimulation } from '@/components/hooks/2d/useGraphSimulation'
import { useGraphRendering } from '@/components/hooks/2d/useGraphRendering'
import { type NodeType } from './types/graph'

type Props = {
  onEditNode: (node: NodeType | null) => void
  graphUse: UseGraphData
  searchQuery: string[]
}

const Graph2D: FC<Props> = ({ onEditNode, graphUse, searchQuery }) => {
  const width = window.innerWidth
  const height = window.innerHeight

  const svgRef = useRef<SVGSVGElement>(null)

  const { graphData, saveData } = graphUse

  const simulationRef = useGraphSimulation(graphData, width, height)

  const handleEditNode = (node: NodeType | null) => {
    onEditNode(node)
  }

  useGraphRendering(
    svgRef,
    simulationRef,
    graphData,
    width,
    height,
    handleEditNode,
    saveData,
    searchQuery,
  )

  return <svg ref={svgRef}></svg>
}

export default Graph2D
