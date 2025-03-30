import { useState } from 'react'
import ControlPanel from './components/ControlPanel'
import Graph2D from './components/Graph2D'
import Graph3D from './components/Graph3D'
import { NodeForm } from '@/components/NodeForm'
import type { NodeType } from './components/types/graph'
import { useGraphData } from '@/components/hooks/main/useGraphData.ts'
import { useGraphEvents } from '@/components/hooks/main/useGraphEvents.ts'
import { Settings } from '@/components/Settings.tsx'

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
      <Settings />
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
            if (formMode === 'add') {
              graphUse.addNode(updatedNode)
              setNodeToForm(null)
            } else {
              graphUse.editNode(updatedNode)
            }
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
