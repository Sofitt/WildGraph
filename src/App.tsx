import { useState } from 'react'
import ControlPanel from './components/ControlPanel'
import Graph2D from './components/Graph2D'
import Graph3D from './components/Graph3D'

function App() {
  const [is3D, setIs3D] = useState<boolean>(false)

  return (
    <div>
      <ControlPanel toggle3D={() => setIs3D((prev) => !prev)} />
      {is3D ? <Graph3D /> : <Graph2D />}
    </div>
  )
}

export default App
