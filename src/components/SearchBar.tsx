import { type FC, type FormEvent, useState, useEffect, useRef } from 'react'
import { type NodeType } from './types/graph'

interface Props {
  emitter: (data: string[]) => void
  className?: string
  nodes?: NodeType[]
}

export const SearchBar: FC<Props> = ({ emitter, className = '', nodes = [] }) => {
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState<NodeType[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (search.trim() === '') {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const filtered = nodes
      .filter((node) => node.name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 10) // Показываем максимум 10 вариантов

    setSuggestions(filtered)
    setShowSuggestions(filtered.length > 0)
    setSelectedIndex(-1)
  }, [search, nodes])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      selectSuggestion(suggestions[selectedIndex])
    } else {
      emitter(search.split(' '))
      setShowSuggestions(false)
    }
  }

  const selectSuggestion = (node: NodeType) => {
    setSearch(node.name)
    emitter([node.name])
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }

  const reset = () => {
    setSearch('')
    emitter([])
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }

  const blur = () => {
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }

  const handleInputBlur = () => {
    // Задержка, чтобы клик по варианту успел сработать
    setTimeout(() => {
      blur()
    }, 200)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          selectSuggestion(suggestions[selectedIndex])
          handleInputBlur()
        } else {
          onSubmit(e)
        }
        break
      case 'Escape':
        blur()
        break
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  return (
    <div className={`relative z-[1] bg-white flex gap-2 justify-center items-center ${className}`}>
      <button onClick={reset}>❌</button>
      <form className='flex gap-2 items-center' onSubmit={onSubmit}>
        <div className='relative'>
          <input
            ref={inputRef}
            type='text'
            value={search}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder='Поиск узлов...'
            className='px-2 py-1 border border-gray-300 rounded'
          />
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className='absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b shadow-lg max-h-60 overflow-y-auto z-10'
            >
              {suggestions.map((node, index) => (
                <div
                  key={node.id}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                    index === selectedIndex ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => selectSuggestion(node)}
                >
                  <div className='font-medium'>{node.name}</div>
                  {node.family.length > 0 && (
                    <div className='text-sm text-gray-500'>Семейство: {node.family.join(', ')}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <button type='submit'>
          <span className='max-2xl:hidden'>Искать</span>
          <span className='2xl:hidden'>🔎</span>
        </button>
      </form>
    </div>
  )
}
