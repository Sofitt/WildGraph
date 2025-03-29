import { GraphData } from '@/components/types/graph.ts'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { clearRecursiveToStringify } from '@/lib/clearRecursiveToStringify.ts'

export const saveDataFile = (data: GraphData, update?: boolean) => {
  const obj = clearRecursiveToStringify(data)
  localStorage.setItem('nodesData', JSON.stringify(obj))
  update && fs.writeFileSync(path.resolve(__dirname) + 'file.json', JSON.stringify(obj))
}
