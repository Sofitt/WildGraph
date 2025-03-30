import { FC, FormEvent, useState } from 'react'

export const SearchBar: FC<{ emitter: (data: string[]) => void }> = ({ emitter }) => {
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
    <div className='z-[1] absolute top-4 left-1/2 -translate-x-1/2 bg-white p-2 flex gap-2 items-center'>
      <button onClick={reset}>❌</button>
      <form className='flex gap-4 items-center' onSubmit={onSubmit}>
        <input type='text' value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type='submit'>Искать</button>
      </form>
    </div>
  )
}
