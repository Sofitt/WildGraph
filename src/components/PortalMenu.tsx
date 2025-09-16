import { type FC, useEffect, useState } from 'react'
import { PortalConnection } from './hooks/usePortals'

interface PortalMenuProps {
  connections: PortalConnection[]
  position: { x: number; y: number }
  onPortalSelect: (nodeId: number) => void
  onClose: () => void
  onMouseEnter?: () => void
}

const PortalMenu: FC<PortalMenuProps> = ({
  connections,
  position,
  onPortalSelect,
  onClose,
  onMouseEnter,
}) => {
  const [adjustedPosition, setAdjustedPosition] = useState({ x: position.x, y: position.y })

  useEffect(() => {
    const menuWidth = 350
    const menuHeight = connections.length * 80 + 60

    let x = position.x + 10
    let y = position.y - 10

    // Проверяем, не выходит ли меню за правую границу экрана
    if (x + menuWidth > window.innerWidth) {
      x = position.x - menuWidth - 10
    }

    // Проверяем, не выходит ли меню за нижнюю границу экрана
    if (y + menuHeight > window.innerHeight) {
      y = position.y - menuHeight + 10
    }

    // Проверяем, не выходит ли меню за левую границу экрана
    if (x < 0) {
      x = 10
    }

    // Проверяем, не выходит ли меню за верхнюю границу экрана
    if (y < 0) {
      y = 10
    }

    setAdjustedPosition({ x, y })
  }, [position, connections.length])

  if (connections.length === 0) return null

  const handleMouseEnter = () => {
    // Отменяем таймер закрытия при наведении на портал
    if (onMouseEnter) {
      onMouseEnter()
    }
  }

  const handleMouseLeave = () => {
    // Закрываем портал при выходе мыши из области меню
    onClose()
  }

  return (
    <div
      className='absolute floating min-w-[200px] max-w-[350px] z-[1000] backdrop-blur-sm'
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className='font-bold mb-2 border-b border-gray-500 pb-1'>
        Порталы ({connections[0].node.name}{connections[0].node.quality ? ` (${connections[0].node.quality})` : ''})
      </div>

      {connections.map((connection) => (
        <div
          key={connection.node.id}
          className='p-2 my-1 rounded cursor-pointer bg-black/10 transition-colors duration-200 border border-transparent hover:bg-black/20 hover:border-black/30'
          onClick={() => onPortalSelect(connection.node.id)}
        >
          <div className='font-bold mb-1 text-sky-300'>ID: {connection.node.id}</div>

          {connection.node.family.length > 0 && (
            <div className=''>Семейство: {connection.node.family.join(', ')}</div>
          )}

          {connection.connections.length > 0 && (
            <div className=''>Связи: {connection.connections.map((c) => c.name).join(', ')}</div>
          )}

          {connection.connections.length === 0 && <div className=''>Нет связей</div>}
        </div>
      ))}
    </div>
  )
}

export default PortalMenu
