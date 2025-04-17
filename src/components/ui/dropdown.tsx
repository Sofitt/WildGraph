import { useState, useRef, useEffect } from 'react'
import { useClickOutside } from '@/lib/useClickOutside'

const Dropdown = ({
  items,
  name,
  notice = '',
  trigger = 'hover',
}: {
  name: string
  items: { text: string; onClick: (...args: any[]) => any }[]
  trigger: 'hover' | 'click'
  notice: string
}) => {
  const [open, setOpen] = useState(false)
  const [alignRight, setAlignRight] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useClickOutside(ref, () => setOpen(false))

  useEffect(() => {
    if (open && ref.current && dropdownRef.current) {
      const { left } = ref.current.getBoundingClientRect()
      const dropdownWidth = dropdownRef.current.offsetWidth
      setAlignRight(left + dropdownWidth > window.innerWidth)
    }
  }, [open])

  const triggerMap = {
    hover: {
      onMouseEnter: () => setOpen(true),
      onMouseLeave: () => setOpen(false),
    },
    click: {
      onClick: () => setOpen((prev) => !prev),
    },
  }
  return (
    <div ref={ref} className='relative inline-block' {...triggerMap[trigger]} title={notice}>
      <button className='px-4 py-2 bg-white border border-gray-300 rounded'>{name}</button>
      {open && (
        <div
          ref={dropdownRef}
          className={`absolute top-full bg-white shadow-lg rounded ${
            alignRight ? 'right-0' : 'left-0'
          }`}
        >
          {items.map(({ text, onClick }, idx) => (
            <div key={idx} className='px-4 py-2 cursor-pointer hover:bg-gray-100' onClick={onClick}>
              {text}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dropdown
