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
  const portalTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
      if (portalTimeoutRef.current) {
        clearTimeout(portalTimeoutRef.current)
        portalTimeoutRef.current = null
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }

      if (!node || !isPortalNode(node.id)) {
        closeTimeoutRef.current = setTimeout(() => {
          setPortalMenu(null)
          closeTimeoutRef.current = null
        }, 500)
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

        portalTimeoutRef.current = setTimeout(() => {
          setPortalMenu(null)
          portalTimeoutRef.current = null
        }, 3000)
      } else {
        closeTimeoutRef.current = setTimeout(() => {
          setPortalMenu(null)
          closeTimeoutRef.current = null
        }, 500)
      }
    },
    [isPortalNode, getPortalConnections],
  )

  const handlePortalSelect = useCallback(
    (nodeId: number) => {
      if (portalTimeoutRef.current) {
        clearTimeout(portalTimeoutRef.current)
        portalTimeoutRef.current = null
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      const targetNode = graphData.nodes.find((n) => n.id === nodeId)
      if (targetNode) {
        onEditNode(targetNode)
      }
      setPortalMenu(null)
    },
    [graphData.nodes, onEditNode],
  )

  const handleClosePortalMenu = useCallback(() => {
    if (portalTimeoutRef.current) {
      clearTimeout(portalTimeoutRef.current)
      portalTimeoutRef.current = null
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setPortalMenu(null)
  }, [])

  const handlePortalMenuMouseEnter = useCallback(() => {
    // Отменяем таймер закрытия при наведении на портал
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
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
            onMouseEnter={handlePortalMenuMouseEnter}
          />,
          document.body,
        )}
    </>
  )
}

export default Graph2D
