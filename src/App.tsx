import { useState } from 'react'
import ControlPanel from './components/ControlPanel'
import Graph2D from './components/Graph2D'
import Graph3D from './components/Graph3D'
import { NodeForm } from '@/components/NodeForm'
import type { NodeType } from './components/types/graph'
import { useGraphData } from '@/components/hooks/main/useGraphData.ts'
import { useGraphEvents } from '@/components/hooks/main/useGraphEvents.ts'
import { Settings } from '@/components/Settings.tsx'
import { SearchBar } from '@/components/SearchBar.tsx'

function App() {
  const graphUse = useGraphData()

  const [is3D, setIs3D] = useState<boolean>(false)

  const [showFamilyList, toggleFamilyList] = useState<boolean>(false)
  const [nodeFormVisible, setNodeFormVisible] = useState<boolean>(false)
  const [nodeToForm, setNodeToForm] = useState<NodeType | null>(null)
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add')
  const [searchQuery, setQuery] = useState<string[]>([])

  const { graphData, updateLinks, saveData, setGraphData, saveToFile, familiesList } = graphUse

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
      <SearchBar emitter={setQuery} />
      <ControlPanel toggle3D={() => setIs3D((prev) => !prev)} />
      <Settings />
      {is3D ? (
        <Graph3D graphUse={graphUse} onEditNode={setEditNode} searchQuery={searchQuery} />
      ) : (
        <Graph2D graphUse={graphUse} onEditNode={setEditNode} searchQuery={searchQuery} />
      )}
      <div className='grid top-4 left-4 gap-4 modal max-h-[40vh] overflow-y-auto'>
        <div className='floating'>
          <button onClick={() => toggleFamilyList((prev) => !prev)}>
            Список семейств - {familiesList.length}
          </button>
          {showFamilyList && (
            <ul className='mt-2'>
              {familiesList.map((fam) => {
                return (
                  <li className='odd:bg-blue-50 p-2 leading-[1]' key={fam}>
                    {fam}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
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
    </div>
  )
}

export default App
