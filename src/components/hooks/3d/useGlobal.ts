import { NumberAsString } from '@/shared/types/helpers.ts'

type Globals = {
  LABEL_UPDATE_INTERVAL: NumberAsString
}
const definitionMap: Record<keyof Globals, string> = {
  LABEL_UPDATE_INTERVAL: '[Число]. Частота обновлений позиции подписей узлов',
}
const defaultData: Globals = {
  LABEL_UPDATE_INTERVAL: '10',
}
const storageKey = 'wild_global'

export const useGlobal = () => {
  const parse = () => {
    return JSON.parse(localStorage.getItem(storageKey) || '{}') as Globals
  }
  const set = (key: keyof Globals, value: any) => {
    try {
      const data = parse()
      data[key] = value
      localStorage.setItem(storageKey, JSON.stringify(data))
    } catch (e) {
      console.error('Ошибка при обновлении настроек:', e)
      return false
    }
    return true
  }
  const setDefault = (force?: boolean) => {
    const data = parse()
    Object.keys(defaultData).forEach((key) => {
      if (!Object.hasOwn(data, key) || force) {
        set(key as keyof Globals, defaultData[key as keyof typeof defaultData])
      }
    })
  }
  setDefault()
  return { parse, setDefault, definitionMap, set }
}
