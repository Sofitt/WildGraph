import { type FC, useEffect } from 'react'
import Dropdown from './ui/dropdown'

interface ControlPanelProps {
  toggle3D: () => void
  className?: string
  updateGraph: () => void
  saveToFile: () => void
  loadFromFile: () => void
}

const ControlPanel: FC<ControlPanelProps> = ({
  toggle3D,
  updateGraph,
  saveToFile,
  loadFromFile,
  className = '',
}) => {
  const textMap = {
    '3d': ['Переключить 3D режим', '3D'],
    node: ['Добавить узел', 'Add'],
  }
  const dropdownList = [
    {
      text: 'Сохранить',
      onClick: saveToFile,
    },
    {
      text: 'Загрузить',
      onClick: loadFromFile,
    },
  ]

  useEffect(() => {
    window.addEventListener('updateGraph', updateGraph)

    return () => {
      window.removeEventListener('updateGraph', updateGraph)
    }
  }, [updateGraph])
  return (
    <div className={`modal grid gap-4 floating ${className}`}>
      <div className='flex items-center gap-2'>
        <button onClick={toggle3D}>
          <span className='max-2xl:hidden'>{textMap['3d'][0]}</span>
          <span className='2xl:hidden'>{textMap['3d'][1]}</span>
        </button>
        <button onClick={updateGraph}>
          <span className='max-2xl:hidden'>{textMap['node'][0]}</span>
          <span className='2xl:hidden'>{textMap['node'][1]}</span>
        </button>
        <Dropdown trigger='hover' items={dropdownList} name='💾' notice='Сохранить в файл' />
      </div>
      <label className='inline-flex items-center justify-between max-2xl:hidden'>
        <span>Сила отталкивания:</span>
        <input type='range' id='repulsionRange' min='-80' max='-10' defaultValue='-30' />
      </label>
    </div>
  )
}

export default ControlPanel
