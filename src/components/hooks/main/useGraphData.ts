import { useState, useEffect, useMemo } from 'react'
import { GraphData, NodeType } from '../../types/graph.ts'
import Save from '@/lib/Save.ts'
import { useNodeAdapter } from '@/components/hooks/main/useNodeAdapter.ts'
import { uniqArrByKey } from '@/lib/uniqArrByKey.ts'

export type UseGraphData = ReturnType<typeof useGraphData>
export function useGraphData() {
  const width = window.innerWidth
  const height = window.innerHeight
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] })

  const familyList = useMemo(() => {
    return [...new Set(graphData.nodes.flatMap((node) => node.family))]
  }, [graphData])

  // Загрузка данных из localStorage
  useEffect(() => {
    const loadData = () => {
      const stored = localStorage.getItem('nodesData')
      if (!stored) return

      const data = JSON.parse(stored)
      // Сброс позиции, если точки за пределами экрана
      data.nodes = data.nodes.map(useNodeAdapter)
      data.nodes.forEach((n: NodeType) => {
        if (n.x < 0 || n.x > width || n.y < 0 || n.y > height) {
          n.x = width / 2
          n.y = height / 2
        }
      })
      updateLinks(data)
      setGraphData(data)
    }

    loadData()
  }, [width, height])

  const saveData = (data?: GraphData) => {
    const temp = data || graphData
    temp.nodes = uniqArrByKey<NodeType>(temp.nodes, 'id')
    Save.toStorage(temp)
  }
  const saveToFile = () => {
    Save.toFile(graphData)
  }

  const addNode = (updatedNode: NodeType) => {
    updatedNode.x = width / 2
    updatedNode.y = height / 2
    updatedNode.z = Math.random() * 200 - 100
    const newData = { ...graphData, nodes: [...graphData.nodes, updatedNode] }
    updateLinks(newData)
    setGraphData(newData)
    saveData(newData)
  }

  const editNode = (updatedNode: NodeType) => {
    const newData = { ...graphData }
    newData.nodes = newData.nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n))
    updateLinks(newData)
    setGraphData(newData)
    saveData(newData)
  }

  const deleteNode = (nodeToDelete: NodeType) => {
    const newNodes = graphData.nodes.filter((n) => n.id !== nodeToDelete.id)
    const newGraphData: GraphData = { nodes: newNodes, links: [] }
    updateLinks(newGraphData)
    setGraphData(newGraphData)
    saveData(newGraphData)
  }

  // Обновление связей на основе семейств
  const updateLinks = (data: GraphData) => {
    const links: any[] = []
    data.nodes.forEach((nodeI, i) => {
      nodeI.join = []
      for (let j = i + 1; j < data.nodes.length; j++) {
        const nodeJ = data.nodes[j]
        const pairBinding =
          nodeI.binding.some((b) => nodeJ.anchor.includes(b)) ||
          nodeJ.binding.some((b) => nodeI.anchor.includes(b))
        const pairFamilies = nodeI.family.some((f) => nodeJ.family.includes(f))
        if (!pairFamilies && !pairBinding) continue
        links.push({ source: nodeI, target: nodeJ })
        nodeI.join.push(nodeJ)
        nodeJ.join.push(nodeI)
      }
    })
    const maxJoin = Math.max(...data.nodes.map((n) => n.join.length))
    const minSize = 5,
      maxSize = 20
    data.nodes.forEach((n) => {
      // Если связей нет, оставляем минимальный размер, иначе масштабируем по количеству связей
      n.size = maxJoin === 0 ? minSize : minSize + (n.join.length / maxJoin) * (maxSize - minSize)
    })
    data.links = links
    return data
  }

  return {
    graphData,
    familyList,
    setGraphData,
    saveData,
    saveToFile,
    editNode,
    addNode,
    deleteNode,
    updateLinks,
  }
}
