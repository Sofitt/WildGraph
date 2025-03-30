import { type FC, type FormEvent, useState, useEffect, useRef } from 'react'
import type { GraphData, NodeType } from '@/components/types/graph.ts'
import { showNotification } from '@/lib/showNotification.ts'

interface NodeFormProps {
  node: NodeType | null
  mode: 'add' | 'edit'
  onSave: (node: NodeType) => void
  onClose: () => void
  onDelete?: (node: NodeType) => void
  graphData: GraphData
}

export const NodeForm: FC<NodeFormProps> = ({
  graphData,
  node,
  mode,
  onSave,
  onClose,
  onDelete,
}) => {
  const [name, setName] = useState<string>('')
  const [family, setFamily] = useState<string>('')
  const [note, setNote] = useState<string>('')
  const [color, setColor] = useState<string>('#ff0000')
  const firstField = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (node) {
      setName(node.name)
      setFamily(node.family.join(' '))
      setNote(node.notes.join('\n'))
      setColor(node.color || '#ff0000')
    } else {
      setName('')
      setFamily('')
      setNote('')
      setColor('#ff0000')
    }
  }, [node])

  const reset = () => {
    setName('')
    setFamily('')
    setNote('')
    setColor('#ff0000')
    firstField.current?.focus()
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const localName = name?.trim()?.toLowerCase()
    if (!localName) {
      showNotification('Название обязательно')
      return
    }
    const families = family.split(' ').map((s) => s.trim().toLowerCase())
    if (!localName.includes(' ') && !families.includes(localName)) {
      families.unshift(localName)
    }

    let id
    if (mode === 'add') {
      id = graphData.nodes.length ? Math.max(...graphData.nodes.map((node) => node.id)) + 1 : 1
    } else {
      id = (node as NodeType).id
    }
    const updatedNode: NodeType = {
      id,
      x: node ? node.x : 0,
      y: node ? node.y : 0,
      z: node ? node.z : 0,
      join: node ? node.join : [],
      size: node ? node.size : 5,
      name: localName[0].toUpperCase() + localName.slice(1),
      family: families,
      notes: note.trim().split('\n'),
      color,
    }

    onSave(updatedNode)
    if (mode === 'add') {
      reset()
    } else {
      showNotification('Сохранено')
    }
  }

  return (
    <div className='floating grid'>
      <h3 className='mb-4'>{mode === 'add' ? 'Добавить узел' : 'Редактировать узел'}</h3>
      <form onSubmit={handleSubmit} className='grid gap-2'>
        <label className='inline-flex items-center gap-2 justify-between'>
          <span className='inline-flex items-center'>
            <span
              className='icon mr-2'
              style={
                {
                  '--icon-symbol': '"?"',
                  '--icon-content':
                    '"Если название будет из одного слова, то оно добавится в семейства"',
                } as object
              }
            />
            Название:
          </span>
          <input
            ref={firstField}
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className='inline-flex items-center gap-2 justify-between'>
          <span className='inline-flex items-center'>
            <span
              className='icon mr-2'
              style={
                {
                  '--icon-symbol': '"?"',
                  '--icon-content':
                    '"Если семейство составное (2 и более слов), тогда вместо пробелов использовать `_`. Для разделения семейств, используется пробел. Пример: стальная_воля воля металл"',
                } as object
              }
            />
            Семейства:
          </span>
          <input
            type='text'
            value={family}
            placeholder='новый_узел узел'
            onChange={(e) => setFamily(e.target.value)}
          />
        </label>
        <div className='inline-flex items-center gap-2 justify-between'>
          <span>Цвет:</span>
          <input type='color' value={color} onChange={(e) => setColor(e.target.value)} />
        </div>

        <div className='grid gap-2'>
          <span>Заметки:</span>
          <textarea
            name='notes'
            placeholder='Здесь могут быть заметки...'
            className='w-full min-h-[100px] max-h-[400px] border border-dashed'
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className='flex items-center gap-4 justify-self-end w-full'>
          {mode === 'edit' && onDelete && node && (
            <button
              className='!bg-red-300 hover:!bg-red-400 mr-auto'
              type='button'
              onClick={() => {
                onDelete(node)
                onClose()
              }}
              title='Удалить'
            >
              🗑️
            </button>
          )}
          <button type='submit'>Сохранить</button>
          <button type='button' onClick={onClose}>
            Закрыть
          </button>
        </div>
      </form>
    </div>
  )
}
