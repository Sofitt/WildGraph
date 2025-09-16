import { type FC, useState } from 'react'
import ControlPanel from './components/ControlPanel'
import Graph2D from './components/Graph2D'
import Graph3D from './components/Graph3D'
import { NodeForm } from '@/components/NodeForm'
import type { NodeType } from './components/types/graph'
import { useGraphData } from '@/components/hooks/main/useGraphData.ts'
import { Settings } from '@/components/Settings.tsx'
import { SearchBar } from '@/components/SearchBar.tsx'
import '@/lib/globalUtils'

const FamilyList: FC<{ list: string[]; className?: string }> = ({ list, className }) => {
  const [showFamilyList, setFamilyList] = useState<boolean>(false)
  return (
    <div className={'floating max-h-[40vh] overflow-y-auto ' + className}>
      <button onClick={() => setFamilyList((prev) => !prev)}>
        Список семейств - {list.length}
      </button>
      {showFamilyList && (
        <ul className='mt-2'>
          {list.map((item) => {
            return (
              <li className='odd:bg-blue-50 p-2 leading-[1]' key={item}>
                {item}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function App() {
  const graphUse = useGraphData()

  const [is3D, setIs3D] = useState<boolean>(false)

  const [nodeFormVisible, setNodeFormVisible] = useState<boolean>(false)
  const [nodeToForm, setNodeToForm] = useState<NodeType | null>(null)
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add')
  const [searchQuery, setQuery] = useState<string[]>([])

  const { graphData, updateLinks, saveData, setGraphData, saveToFile, loadFromFile, familyList } =
    graphUse

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

  return (
    <div className='overflow-y-hidden'>
      <ControlPanel
        className='max-2xl:hidden right-4 top-4'
        toggle3D={() => setIs3D((prev) => !prev)}
        updateGraph={updateGraph}
        saveToFile={saveToFile}
        loadFromFile={loadFromFile}
      />
      <SearchBar
        className='max-2xl:hidden absolute top-4 left-1/2 -translate-x-1/2'
        emitter={setQuery}
        nodes={graphData.nodes}
      />
      <Settings />
      {is3D ? (
        <Graph3D graphUse={graphUse} onEditNode={setEditNode} searchQuery={searchQuery} />
      ) : (
        <Graph2D graphUse={graphUse} onEditNode={setEditNode} searchQuery={searchQuery} />
      )}
      <div className='pointer-events-none z-[1] flex flex-wrap md:flex-row-reverse items-start 2xl:grid top-4 left-4 gap-4 modal max-2xl:w-[calc(100%-32px)] justify-between max-h-[40vh]'>
        <ControlPanel
          className='2xl:!hidden !static pointer-events-auto'
          toggle3D={() => setIs3D((prev) => !prev)}
          updateGraph={updateGraph}
          saveToFile={saveToFile}
          loadFromFile={loadFromFile}
        />
        <SearchBar className='2xl:!hidden pointer-events-auto' emitter={setQuery} nodes={graphData.nodes} />
        <FamilyList list={familyList} className='pointer-events-auto' />
        {nodeFormVisible && (
          <NodeForm
            className='pointer-events-auto'
            graphData={graphData}
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
