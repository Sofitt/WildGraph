import { type FC } from 'react'
import { PortalConnection } from './hooks/usePortals'

interface PortalMenuProps {
  connections: PortalConnection[]
  position: { x: number; y: number }
  onPortalSelect: (nodeId: number) => void
  onClose: () => void
}

const PortalMenu: FC<PortalMenuProps> = ({ connections, position, onPortalSelect, onClose }) => {
  if (connections.length === 0) return null

  return (
    <div
      className='absolute floating min-w-[200px] max-w-[350px] z-[1000] backdrop-blur-sm'
      style={{
        left: position.x + 10,
        top: position.y - 10,
      }}
      onMouseLeave={onClose}
    >
      <div className='font-bold mb-2 border-b border-gray-500 pb-1'>
        Порталы ({connections[0].node.name})
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
