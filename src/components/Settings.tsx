import { useGlobal } from '@/components/hooks/3d/useGlobal.ts'
import { type ChangeEvent, type FC, useState } from 'react'
import './style/settings.pcss'

export const Settings: FC<{ className?: string }> = ({ className = '' }) => {
  const { parse, definitionMap, set } = useGlobal()
  const [settings, setSettings] = useState(parse())
  const [showBlock, setShowBlock] = useState(false)

  const updateSettings = (e: ChangeEvent<HTMLInputElement>, key: keyof typeof definitionMap) => {
    const value = e.target.value
    setSettings((prev) => {
      const obj = { ...prev }
      //@ts-ignore
      obj[key] = value
      return obj
    })
    set(key, value)
  }
  return (
    <div
      style={{
        translate: showBlock ? '0 0' : '0 calc(100% - 46px)',
      }}
      className={`settings z-[1] absolute left-4 bottom-2 max-2xl:-mx-2 p-2 max-h-[400px] overflow-y-auto grid gap-2 w-full max-w-[calc(100%-16px)] ${className}`}
    >
      <button className='w-fit' onClick={() => setShowBlock((prev) => !prev)}>
        <span className={`block ${showBlock ? 'rotate-180' : ''}`}>⬆️</span>
      </button>
      <div className='p-2 border border-solid w-fit flex bg-white'>
        <span
          className='icon'
          style={
            {
              '--icon-symbol': '"?"',
              '--icon-content': `"После обновления настроек, требуется перезагрузка страницы"`,
              '--icon-offsetY': '-50%',
              '--icon-offsetX': '24px',
            } as object
          }
        />
      </div>
      <div className='grid gap-2 max-h-[250px] bg-white px-2 border border-solid border-white'>
        {Object.keys(definitionMap).map((key) => {
          const inputMap = {
            boolean: 'checkbox',
            string: 'text',
          }
          // @ts-ignore
          const inputType = inputMap[typeof settings[key]] || 'text'
          // @ts-ignore
          const value = settings[key]
          return (
            <label
              key={key}
              className='inline-grid md:inline-flex md:items-center md:justify-between gap-2'
            >
              <span className='inline-flex items-center gap-2'>
                <span
                  className='icon'
                  style={
                    {
                      '--icon-symbol': '"?"',
                      '--icon-content': `"${definitionMap[key as keyof typeof definitionMap]}"`,
                    } as object
                  }
                />
                <span>{key}</span>
              </span>
              <input
                className='2xl:ml-auto'
                type={inputType}
                value={value}
                onChange={(e) => updateSettings(e, key as keyof typeof definitionMap)}
              />
            </label>
          )
        })}
      </div>
    </div>
  )
}
