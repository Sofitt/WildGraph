import { useState } from 'react'
import ControlPanel from './components/ControlPanel'
import Graph2D from './components/Graph2D'
import Graph3D from './components/Graph3D'
import { NodeForm } from '@/components/NodeForm'
import type { NodeType } from './components/types/graph'
import { useGraphData } from '@/components/2d/useGraphData.ts'
import { useGraphEvents } from '@/components/2d/useGraphEvents.ts'

function App() {
  const width = 800,
    height = 600
  const graphUse = useGraphData(width, height)

  const [is3D, setIs3D] = useState<boolean>(false)

  const [nodeFormVisible, setNodeFormVisible] = useState<boolean>(false)
  const [nodeToForm, setNodeToForm] = useState<NodeType | null>(null)
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add')

  const { graphData, updateLinks, saveData, setGraphData, saveToFile } = graphUse

  const setEditNode = (node: NodeType | null) => {
    setFormMode('edit')
    setNodeToForm(node)
    setNodeFormVisible(true)
  }
  const updateGraph = () => {
    setFormMode('add')
    setNodeToForm(null)
    setNodeFormVisible(true)

    const updatedData = { ...graphData }
    updateLinks(updatedData)
    setGraphData(updatedData)
    saveData(updatedData)
  }

  useGraphEvents(updateGraph, saveToFile)

  return (
    <div>
      <ControlPanel toggle3D={() => setIs3D((prev) => !prev)} />
      {is3D ? (
        <Graph3D graphUse={graphUse} onEditNode={setEditNode} />
      ) : (
        <Graph2D graphUse={graphUse} onEditNode={setEditNode} />
      )}
      {nodeFormVisible && (
        <NodeForm
          node={nodeToForm}
          mode={formMode}
          onSave={(updatedNode) => {
            ;(formMode === 'add' ? graphUse.addNode : graphUse.editNode)(updatedNode)
            setNodeToForm(null)
          }}
          onDelete={(nodeToDelete) => {
            graphUse.deleteNode(nodeToDelete)
            setNodeToForm(null)
          }}
          onClose={() => {
            setNodeFormVisible(false)
            setNodeToForm(null)
          }}
        />
      )}
    </div>
  )
}

export default App
