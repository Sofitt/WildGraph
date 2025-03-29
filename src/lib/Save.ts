import { GraphData } from '@/components/types/graph.ts'
import { clearRecursiveToStringify } from '@/lib/clearRecursiveToStringify.ts'

const toFile = (data: GraphData) => {
  const obj = clearRecursiveToStringify(data)
  // В браузере нельзя использовать Node fs. Вместо этого можно инициировать скачивание файла:
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'wild_graph.json'
  link.click()
  URL.revokeObjectURL(url)
}

const toStorage = (data: GraphData) => {
  const obj = clearRecursiveToStringify(data)
  localStorage.setItem('nodesData', JSON.stringify(obj))
}
const Save = {
  toFile,
  toStorage,
}
export default Save
