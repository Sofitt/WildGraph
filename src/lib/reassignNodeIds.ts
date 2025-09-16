import type { GraphData, NodeType, LinkType } from '@/components/types/graph'

/**
 * Переназначает ID всех узлов в порядке возрастания (1, 2, 3, ...)
 * и обновляет все связи соответственно
 */
export function reassignNodeIds(graphData: GraphData): GraphData {
  // Создаем карту старых ID к новым ID
  const idMapping = new Map<number, number>()
  
  // Сортируем узлы по текущим ID для стабильности
  const sortedNodes = [...graphData.nodes].sort((a, b) => a.id - b.id)
  
  // Назначаем новые ID в порядке возрастания
  sortedNodes.forEach((node, index) => {
    const newId = index + 1
    idMapping.set(node.id, newId)
  })
  
  // Обновляем узлы с новыми ID
  const updatedNodes: NodeType[] = sortedNodes.map((node, index) => ({
    ...node,
    id: index + 1
  }))
  
  // Обновляем связи с новыми ID
  const updatedLinks: LinkType[] = graphData.links.map(link => ({
    ...link,
    source: {
      ...link.source,
      id: idMapping.get(link.source.id) || link.source.id
    },
    target: {
      ...link.target,
      id: idMapping.get(link.target.id) || link.target.id
    }
  }))
  
  return {
    nodes: updatedNodes,
    links: updatedLinks
  }
}
