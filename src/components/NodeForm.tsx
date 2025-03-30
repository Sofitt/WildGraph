import { type FC, type FormEvent, useState, useEffect, useRef } from 'react'
import type { NodeType } from '@/components/types/graph.ts'

interface NodeFormProps {
  node: NodeType | null
  mode: 'add' | 'edit'
  onSave: (node: NodeType) => void
  onClose: () => void
  onDelete?: (node: NodeType) => void
}

export const NodeForm: FC<NodeFormProps> = ({ node, mode, onSave, onClose, onDelete }) => {
  const [name, setName] = useState<string>('')
  const [family, setFamily] = useState<string>('')
  const [color, setColor] = useState<string>('#ff0000')
  const firstField = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (node) {
      setName(node.name)
      setFamily(node.family.join(', '))
      setColor(node.color || '#ff0000')
    } else {
      setName('')
      setFamily('')
      setColor('#ff0000')
    }
  }, [node])

  const reset = () => {
    setName('')
    setFamily('')
    setColor('#ff0000')
    firstField.current?.focus()
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !family.trim()) {
      alert('Название и семейство обязательны')
      return
    }
    const families = family.split(',').map((s) => s.trim().toLowerCase())
    // Для нового узла задаем x,y = 0; их можно переопределить позже в родительском компоненте
    const updatedNode: NodeType = {
      x: node ? node.x : 0,
      y: node ? node.y : 0,
      z: node ? node.z : 0,
      join: node ? node.join : [],
      size: node ? node.size : 5,
      name: name.trim(),
      family: families,
      color,
    }
    onSave(updatedNode)
    reset()
  }

  return (
    <div
      className='modal floating'
      style={{
        display: 'grid',
        position: 'absolute',
        top: '50px',
        left: '50px',
        zIndex: 1000,
      }}
    >
      <h3>{mode === 'add' ? 'Добавить узел' : 'Редактировать узел'}</h3>
      <form onSubmit={handleSubmit} className='grid gap-2'>
        <label className='inline-flex items-center gap-2 justify-between'>
          <span>Название:</span>
          <input
            ref={firstField}
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className='inline-flex items-center gap-2 justify-between'>
          <span>Семейства (через запятую):</span>
          <input type='text' value={family} onChange={(e) => setFamily(e.target.value)} />
        </label>
        <label className='inline-flex items-center gap-2 justify-between'>
          <span>Цвет:</span>
          <input type='color' value={color} onChange={(e) => setColor(e.target.value)} />
        </label>
        <div className='flex items-center gap-4 justify-self-end'>
          {mode === 'edit' && onDelete && node && (
            <button
              className='!bg-red-300 hover:!bg-red-400'
              type='button'
              onClick={() => {
                onDelete(node)
                onClose()
              }}
            >
              Удалить
            </button>
          )}
          <button type='submit'>Сохранить</button>
          <button type='button' onClick={onClose}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  )
}
