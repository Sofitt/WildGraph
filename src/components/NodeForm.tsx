import { type FC, type FormEvent, useState, useEffect, useRef, useMemo, ChangeEvent } from 'react'
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
  const [anchor, setAnchor] = useState<string>('')
  const [binding, setBinding] = useState<string>('')
  const [note, setNote] = useState<string>('')
  const [color, setColor] = useState<string>('#ff0000')
  const firstField = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstField.current = document.querySelector('input[data-key="1"]')
  })

  const fields = useMemo(
    () => [
      {
        title: 'Название',
        icon: {
          symbol: '"?"',
          content: '"Если название будет из одного слова, то оно добавится в семейства"',
        },
        input: {
          placeholder: '',
          ref: 1,
          set: (e: ChangeEvent<HTMLInputElement>) => setName(e.target.value),
          get: name,
        },
      },
      {
        title: 'Семейство',
        icon: {
          symbol: '"?"',
          content:
            '"Если семейство составное (2 и более слов), тогда вместо пробелов использовать `_`. Для разделения семейств, используется пробел. Пример: стальная_воля воля металл"',
        },
        input: {
          placeholder: '',
          ref: 2,
          set: (e: ChangeEvent<HTMLInputElement>) => setFamily(e.target.value),
          get: family,
        },
      },
      {
        title: 'Признак',
        icon: {
          symbol: '"?"',
          content:
            '"Якорь для ПРИВЯЗКИ других узлов. Предполагается, что признаки будут уникальными для каждого узла"',
        },
        input: {
          placeholder: '',
          ref: 3,
          set: (e: ChangeEvent<HTMLInputElement>) => setAnchor(e.target.value),
          get: anchor,
        },
      },
      {
        title: 'Привязка',
        icon: {
          symbol: '"?"',
          content:
            '"Связывает узел с другим узлом указанного семейства, в случае, если оно является его признаком"',
        },
        input: {
          placeholder: '',
          ref: 4,
          set: (e: ChangeEvent<HTMLInputElement>) => setBinding(e.target.value),
          get: binding,
        },
      },
    ],
    [name, family, anchor, binding],
  )

  useEffect(() => {
    if (node) {
      setName(node.name)
      setFamily(node.family.join(' '))
      setAnchor(node.anchor.join(' '))
      setBinding(node.binding.join(' '))
      setNote(node.notes.join('\n'))
      setColor(node.color || '#ff0000')
    } else {
      setName('')
      setFamily('')
      setAnchor('')
      setBinding('')
      setNote('')
      setColor('#ff0000')
    }
  }, [node])

  const reset = () => {
    setName('')
    setFamily('')
    setAnchor('')
    setBinding('')
    setNote('')
    setColor('#ff0000')
    firstField.current?.focus()
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const localName = name.trim()
    if (!localName) {
      showNotification('Название обязательно')
      return
    }
    const transform = (value: string, split: string, toLowerCase?: boolean) =>
      value.trim()
        ? value
            .trim()
            .split(split)
            .map((s) => {
              return toLowerCase ? s.trim().toLowerCase() : s.trim()
            })
        : []

    const families = transform(family, ' ', true)
    const anchors = transform(anchor, ' ', true)
    const bindings = transform(binding, ' ', true)
    const notes = transform(note, '\n')
    if (!localName.includes(' ')) {
      const tempName = localName.toLowerCase()
      if (!families.includes(tempName)) {
        families.unshift(tempName)
      } else if (!anchors.length) {
        anchors.push(tempName)
      }
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
      anchor: anchors,
      binding: bindings,
      notes,
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
        {fields.map((f) => {
          return (
            <label className='inline-flex items-center gap-2 justify-between' key={f.title}>
              <span className='inline-flex items-center'>
                <span
                  className='icon mr-2'
                  style={
                    {
                      '--icon-symbol': `${f.icon.symbol}`,
                      '--icon-content': `${f.icon.content}`,
                    } as object
                  }
                />
                {f.title}:
              </span>
              <input
                data-key={f.input.ref}
                type='text'
                placeholder={f.input.placeholder}
                value={f.input.get}
                onChange={f.input.set}
              />
            </label>
          )
        })}
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
