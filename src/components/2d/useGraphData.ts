import { useState, useEffect } from 'react'
import { GraphData, NodeType } from '../types/graph'
import { saveDataFile } from '@/lib/saveDataFile.ts'

export function useGraphData(width: number, height: number) {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] })

  // Загрузка данных из localStorage
  useEffect(() => {
    const loadData = () => {
      const stored = localStorage.getItem('nodesData')
      if (!stored) return

      const data = JSON.parse(stored)
      // Сброс позиции, если точки за пределами экрана
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

  const saveData = (data?: { data?: GraphData; update?: boolean }) => {
    saveDataFile(data?.data || graphData, data?.update)
  }

  const addNode = (updatedNode: NodeType) => {
    updatedNode.x = width / 2
    updatedNode.y = height / 2
    const newData = { ...graphData, nodes: [...graphData.nodes, updatedNode] }
    updateLinks(newData)
    setGraphData(newData)
    saveData({ data: newData, update: true })
  }

  const editNode = (updatedNode: NodeType) => {
    const newData = { ...graphData }
    newData.nodes = newData.nodes.map((n) => (n.name === updatedNode.name ? updatedNode : n))
    updateLinks(newData)
    setGraphData(newData)
    saveData({ data: newData, update: true })
  }

  const deleteNode = (nodeToDelete: NodeType) => {
    const newNodes = graphData.nodes.filter((n) => n.name !== nodeToDelete.name)
    const newGraphData: GraphData = { nodes: newNodes, links: [] }
    updateLinks(newGraphData)
    setGraphData(newGraphData)
    saveData({ data: newGraphData, update: true })
  }

  // Обновление связей на основе семейств
  const updateLinks = (data: GraphData) => {
    data.nodes.forEach((n) => (n.join = []))
    const links: any[] = []
    data.nodes.forEach((nodeI, i) => {
      for (let j = i + 1; j < data.nodes.length; j++) {
        const nodeJ = data.nodes[j]
        const pairFamilies = nodeI.family.some((f) => nodeJ.family.includes(f))
        if (!pairFamilies) continue
        links.push({ source: nodeI, target: nodeJ })
        nodeI.join.push(nodeJ)
        nodeJ.join.push(nodeI)
      }
    })
    data.links = links
    return data
  }

  return {
    graphData,
    setGraphData,
    saveData,
    editNode,
    addNode,
    deleteNode,
    updateLinks,
  }
}
