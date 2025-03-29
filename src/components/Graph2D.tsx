import { type FC, useRef, useState } from 'react'
import { useGraphData } from './2d/useGraphData'
import { useGraphSimulation } from './2d/useGraphSimulation'
import { useGraphRendering } from './2d/useGraphRendering'
import { useGraphEvents } from './2d/useGraphEvents'
import { type NodeType } from './types/graph'
import { NodeForm } from '@/components/NodeForm.tsx'
import Save from '@/lib/Save.ts'

const Graph2D: FC = () => {
  const width = 800,
    height = 600
  const svgRef = useRef<SVGSVGElement>(null)
  const [nodeFormVisible, setNodeFormVisible] = useState<boolean>(false)
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add')
  const [currentNode, setCurrentNode] = useState<NodeType | null>(null)

  // Инициализация данных графа
  const {
    graphData,
    setGraphData,
    saveData,
    saveToFile,
    updateLinks,
    deleteNode,
    addNode,
    editNode,
  } = useGraphData(width, height)

  // Настройка симуляции D3
  const simulationRef = useGraphSimulation(graphData, width, height)

  const setEditNode = (d: NodeType | null) => {
    setFormMode('edit')
    setCurrentNode(d)
    setNodeFormVisible(true)
  }
  // Отрисовка графа
  useGraphRendering(svgRef, simulationRef, graphData, width, height, setEditNode, saveData)

  // Функция обновления графа
  const updateGraph = () => {
    const updatedData = { ...graphData }
    setFormMode('add')
    setCurrentNode(null)
    setNodeFormVisible(true)

    updateLinks(updatedData)
    setGraphData(updatedData)
    saveData(updatedData)
  }

  // Подписка на внешние события
  useGraphEvents(updateGraph, saveToFile)

  return (
    <>
      <svg ref={svgRef}></svg>
      {nodeFormVisible && (
        <NodeForm
          node={currentNode}
          mode={formMode}
          onSave={(updatedNode) => {
            ;(formMode === 'add' ? addNode : editNode)(updatedNode)
          }}
          onDelete={deleteNode}
          onClose={() => setNodeFormVisible(false)}
        />
      )}
    </>
  )
}

export default Graph2D
