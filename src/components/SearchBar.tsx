import { type FC, type FormEvent, useState } from 'react'

interface Props {
  emitter: (data: string[]) => void
  className?: string
}

export const SearchBar: FC<Props> = ({ emitter, className = '' }) => {
  const [search, setSearch] = useState('')
  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    emitter(search.split(' '))
  }
  const reset = () => {
    setSearch('')
    emitter(search.split(' '))
  }
  return (
    <div className={`z-[1]  bg-white flex gap-2 items-center ${className}`}>
      <button onClick={reset}>❌</button>
      <form className='flex gap-2 items-center' onSubmit={onSubmit}>
        <input type='text' value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type='submit'>
          <span className='max-2xl:hidden'>Искать</span>
          <span className='2xl:hidden'>🔎</span>
        </button>
      </form>
    </div>
  )
}
