import { useState, useEffect, useMemo } from 'react'
import { GraphData, NodeType } from '../../types/graph.ts'
import Save from '@/lib/Save.ts'
import { useNodeAdapter } from '@/components/hooks/main/useNodeAdapter.ts'
import { uniqArrByKey } from '@/lib/uniqArrByKey.ts'
import { GraphDataAdapter } from '@/lib/adapter/GraphData.ts'

export type UseGraphData = ReturnType<typeof useGraphData>
export function useGraphData() {
  const [graphData, _setGraphData] = useState<GraphData>({ nodes: [], links: [] })
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth || 1,
    height: window.innerHeight || 1,
  })

  const setGraphData = (data: GraphData) => {
    // @ts-ignore
    window._graphData = data
    _setGraphData(data)
  }

  const familyList = useMemo(() => {
    return [...new Set(graphData.nodes.flatMap((node) => node.family))]
  }, [graphData])

  const loadData = (payload?: GraphData) => {
    const stored = localStorage.getItem('nodesData')
    if (!stored && !payload) return

    const data = payload || JSON.parse(stored as string)
    // Сброс позиции, если точки за пределами экрана
    data.nodes = data.nodes.map(useNodeAdapter)
    data.nodes.forEach((n: NodeType) => {
      if (n.x < 0 || n.x > windowSize.width || n.y < 0 || n.y > windowSize.height) {
        n.x = windowSize.width / 2
        n.y = windowSize.height / 2
      }
    })
    updateLinks(data)
    setGraphData(data)
  }

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

  // Загрузка данных из localStorage только при монтировании
  useEffect(() => {
    loadData()
  }, [])

  // НЕ корректируем позиции автоматически при ресайзе - это может вызывать ненужные перерендеры
  // Коррекция позиций происходит только при загрузке данных из localStorage

  const saveData = (data?: GraphData) => {
    const temp = data ? { ...data } : { ...graphData }
    temp.nodes = uniqArrByKey<NodeType>(temp.nodes, 'id')
    Save.toStorage(temp)
  }
  // @ts-ignore
  window._saveData = saveData
  const saveToFile = () => {
    Save.toFile(graphData)
  }
  const loadFromData = (value: any) => {
    try {
      const data = GraphDataAdapter(value) as GraphData
      loadData(data)
      saveData(data)
    } catch (e) {
      console.error(e)
    }
  }

  if (typeof window !== 'undefined') {
    window._Utils = { ...(window._Utils || {}), loadFromData }
  }

  const loadFromFile = async () => {
    try {
      const json = await new Promise((resolve, reject) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'application/json'
        input.onchange = async (e) => {
          // @ts-ignore
          const file = e?.target?.files?.[0]
          if (!file) {
            reject(new Error('Файл не выбран'))
            return
          }
          try {
            const text = await file.text()
            const json = JSON.parse(text)
            resolve(json)
          } catch (err) {
            reject(err)
          }
        }
        input.click()
      })
      if (
        typeof json === 'object' &&
        (!Object.hasOwn(json as object, 'nodes') || !Object.hasOwn(json as object, 'links'))
      )
        return
      loadFromData(json)
    } catch (e) {
      console.error(e)
    }
  }

  const addNode = (updatedNode: NodeType) => {
    updatedNode = useNodeAdapter(updatedNode)
    updatedNode.isCentral = !graphData.nodes.length
    updatedNode.x = windowSize.width / 2
    updatedNode.y = windowSize.height / 2
    updatedNode.z = Math.random() * 200 - 100
    const newData = { ...graphData, nodes: [...graphData.nodes, updatedNode] }
    updateLinks(newData)
    setGraphData(newData)
    saveData(newData)
  }

  const editNode = (updatedNode: NodeType) => {
    const newData = { ...graphData }
    updatedNode = useNodeAdapter(updatedNode)
    // ВАЖНО: Обновляем существующий объект вместо замены, чтобы сохранить ссылки D3
    newData.nodes = newData.nodes.map((n) => {
      if (n.id === updatedNode.id) {
        // Обновляем свойства существующего объекта, сохраняя ссылку
        Object.assign(n, updatedNode)
        return n
      }
      return n
    })

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
    // Защита от NaN координат перед созданием связей
    data.nodes.forEach((node) => {
      if (typeof node.x !== 'number' || isNaN(node.x)) node.x = 0
      if (typeof node.y !== 'number' || isNaN(node.y)) node.y = 0
      if (typeof node.z !== 'number' || isNaN(node.z)) node.z = 0
    })

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
    loadFromFile,
    editNode,
    addNode,
    deleteNode,
    updateLinks,
  }
}
