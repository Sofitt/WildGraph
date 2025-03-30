import React from 'react'

interface ControlPanelProps {
  toggle3D: () => void
}

const ControlPanel: React.FC<ControlPanelProps> = ({ toggle3D }) => {
  return (
    <div className='control-panel grid gap-4 right-4 top-4 floating'>
      <div className='flex items-center gap-2'>
        <button onClick={toggle3D}>Переключить 3D режим</button>
        <button id='addNodeBtn'>Добавить узел</button>
        <button id='saveToFileBtn' title='Сохранить в файл'>
          💾
        </button>
      </div>
      <label className='inline-flex items-center justify-between'>
        <span>Сила отталкивания:</span>
        <input type='range' id='repulsionRange' min='-200' max='-10' defaultValue='-50' />
      </label>
    </div>
  )
}

export default ControlPanel
