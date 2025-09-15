import { type FC } from 'react'
import { PortalConnection } from './hooks/usePortals'

interface PortalMenuProps {
  connections: PortalConnection[]
  position: { x: number; y: number }
  onPortalSelect: (nodeId: number) => void
  onClose: () => void
}

const PortalMenu: FC<PortalMenuProps> = ({ 
  connections, 
  position, 
  onPortalSelect, 
  onClose 
}) => {
  if (connections.length === 0) return null

  return (
    <div 
      className="absolute bg-black/90 border border-gray-600 rounded-lg p-2 min-w-[200px] max-w-[300px] z-[1000] text-white text-xs shadow-xl backdrop-blur-sm animate-in fade-in-0 slide-in-from-top-1 duration-200"
      style={{
        left: position.x + 10,
        top: position.y - 10,
      }}
      onMouseLeave={onClose}
    >
      <div className="font-bold mb-2 border-b border-gray-500 pb-1 text-white">
        Порталы ({connections[0].node.name})
      </div>
      
      {connections.map((connection, index) => (
        <div 
          key={connection.node.id}
          className="p-2 my-1 rounded cursor-pointer bg-white/10 transition-colors duration-200 border border-transparent hover:bg-white/20 hover:border-white/30"
          onClick={() => onPortalSelect(connection.node.id)}
        >
          <div className="font-bold mb-1 text-sky-300">
            ID: {connection.node.id}
          </div>
          
          {connection.node.family.length > 0 && (
            <div className="text-[10px] text-gray-300 mb-1">
              Семейство: {connection.node.family.join(', ')}
            </div>
          )}
          
          {connection.connections.length > 0 && (
            <div className="text-[10px] text-gray-400">
              Связи: {connection.connections.map(c => c.name).join(', ')}
            </div>
          )}
          
          {connection.connections.length === 0 && (
            <div className="text-[10px] text-gray-500 italic">
              Нет связей
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default PortalMenu
