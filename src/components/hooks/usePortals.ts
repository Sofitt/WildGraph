import { useMemo, useCallback } from 'react'
import { NodeType, GraphData } from '../types/graph'

export interface PortalGroup {
  name: string
  nodes: NodeType[]
}

export interface PortalNode extends NodeType {
  portalGroup?: PortalGroup
  hasPortals: boolean
}

export interface PortalConnection {
  node: NodeType
  connections: NodeType[] // ближайшие связи этого нода
}

export function usePortals(graphData: GraphData) {
  const portalGroups = useMemo(() => {
    // Группируем ноды по названию
    const groups = new Map<string, NodeType[]>()
    
    graphData.nodes.forEach(node => {
      const name = node.name.toLowerCase().trim()
      if (!groups.has(name)) {
        groups.set(name, [])
      }
      groups.get(name)!.push(node)
    })
    
    // Оставляем только группы с более чем одним нодом
    const portalGroups: PortalGroup[] = []
    groups.forEach((nodes, name) => {
      if (nodes.length > 1) {
        portalGroups.push({ name, nodes })
      }
    })
    
    return portalGroups
  }, [graphData.nodes])

  const portalNodes = useMemo(() => {
    const portalNodeMap = new Map<number, PortalNode>()
    
    // Создаем расширенные ноды с информацией о порталах
    graphData.nodes.forEach(node => {
      const portalGroup = portalGroups.find(group => 
        group.nodes.some(n => n.id === node.id)
      )
      
      const portalNode: PortalNode = {
        ...node,
        portalGroup,
        hasPortals: !!portalGroup
      }
      
      portalNodeMap.set(node.id, portalNode)
    })
    
    return Array.from(portalNodeMap.values())
  }, [graphData.nodes, portalGroups])

  const getPortalConnections = useCallback((nodeId: number): PortalConnection[] => {
    const targetNode = portalNodes.find(n => n.id === nodeId)
    if (!targetNode?.portalGroup) return []
    
    return targetNode.portalGroup.nodes
      .filter(n => n.id !== nodeId) // исключаем сам нод
      .map(node => {
        // Находим ближайшие связи для каждого портального нода
        const connections = graphData.links
          .filter(link => 
            (link.source.id === node.id || link.target.id === node.id)
          )
          .map(link => 
            link.source.id === node.id ? link.target : link.source
          )
          .filter((connectedNode, index, arr) => 
            // Убираем дубликаты
            arr.findIndex(n => n.id === connectedNode.id) === index
          )
        
        return {
          node,
          connections
        }
      })
  }, [portalNodes, graphData.links])

  const isPortalNode = useCallback((nodeId: number): boolean => {
    return portalNodes.some(n => n.id === nodeId && n.hasPortals)
  }, [portalNodes])

  return {
    portalGroups,
    portalNodes,
    getPortalConnections,
    isPortalNode
  }
}
