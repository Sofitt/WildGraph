import { useGlobal } from '@/components/hooks/3d/useGlobal.ts'
import { ChangeEvent, useState } from 'react'

export const Settings = () => {
  const { parse, definitionMap, set } = useGlobal()
  const [settings, setSettings] = useState(parse())

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
    <div className='z-[1] absolute left-4 bottom-2 bg-white p-2 max-h-[400px] overflow-y-auto grid gap-2'>
      <div className='p-2 border border-solid w-fit flex'>
        <span
          className='icon'
          style={
            {
              '--icon-symbol': '"?"',
              '--icon-content': `"После обновления настроек, требуется перезагрузка страницы"`,
            } as object
          }
        />
      </div>
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
          <label key={key} className='inline-flex items-center gap-2'>
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
            <input
              className='ml-auto'
              type={inputType}
              value={value}
              onChange={(e) => updateSettings(e, key as keyof typeof definitionMap)}
            />
          </label>
        )
      })}
    </div>
  )
}
