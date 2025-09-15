import { type FC, useRef, useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { type ZoomTransform } from 'd3-zoom'
import { type UseGraphData } from '@/components/hooks/main/useGraphData.ts'
import { useGraphSimulation } from '@/components/hooks/2d/useGraphSimulation'
import { useGraphRendering } from '@/components/hooks/2d/useGraphRendering'
import { type NodeType } from './types/graph'
import { usePortals, PortalConnection } from './hooks/usePortals'
import PortalMenu from './PortalMenu'

type Props = {
  onEditNode: (node: NodeType | null) => void
  graphUse: UseGraphData
  searchQuery: string[]
}

const Graph2D: FC<Props> = ({ onEditNode, graphUse, searchQuery }) => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const { width, height } = windowSize
  const svgRef = useRef<SVGSVGElement>(null)
  const zoomTransformRef = useRef<ZoomTransform | null>(null)

  const [portalMenu, setPortalMenu] = useState<{
    connections: PortalConnection[]
    position: { x: number; y: number }
  } | null>(null)

  const { graphData, saveData } = graphUse
  const { getPortalConnections, isPortalNode } = usePortals(graphData)

  const simulationRef = useGraphSimulation(graphData, width, height)

  const handleEditNode = useCallback(
    (node: NodeType | null) => {
      onEditNode(node)
    },
    [onEditNode],
  )

  const handleNodeHover = useCallback(
    (node: NodeType | null, event?: MouseEvent) => {
      if (!node || !isPortalNode(node.id)) {
        setPortalMenu(null)
        return
      }

      const connections = getPortalConnections(node.id)

      if (
        connections.length > 0 &&
        event &&
        event.clientX !== undefined &&
        event.clientY !== undefined
      ) {
        setPortalMenu({
          connections,
          position: { x: event.clientX, y: event.clientY },
        })
      } else {
        setPortalMenu(null)
      }
    },
    [isPortalNode, getPortalConnections],
  )

  const handlePortalSelect = useCallback(
    (nodeId: number) => {
      const targetNode = graphData.nodes.find((n) => n.id === nodeId)
      if (targetNode) {
        onEditNode(targetNode)
      }
      setPortalMenu(null)
    },
    [graphData.nodes, onEditNode],
  )

  const handleClosePortalMenu = useCallback(() => {
    setPortalMenu(null)
  }, [])

  useGraphRendering(
    svgRef,
    simulationRef,
    graphData,
    width,
    height,
    handleEditNode,
    saveData,
    searchQuery,
    handleNodeHover,
    zoomTransformRef,
  )

  return (
    <>
      <svg ref={svgRef}></svg>
      {portalMenu &&
        createPortal(
          <PortalMenu
            connections={portalMenu.connections}
            position={portalMenu.position}
            onPortalSelect={handlePortalSelect}
            onClose={handleClosePortalMenu}
          />,
          document.body,
        )}
    </>
  )
}

export default Graph2D
