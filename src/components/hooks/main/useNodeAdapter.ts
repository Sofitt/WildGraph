import { NodeType } from '@/components/types/graph.ts'
import { createNode } from '@/lib/adapter/GraphData.ts'

export const useNodeAdapter = (node: Partial<NodeType>) => {
  const template = createNode({
    id: 1,
    name: 'template',
  })
  for (const key in node) {
    // @ts-ignore
    template[key] = node[key]
    if (key === 'z') {
      template[key] = 0
    }
    // Защита от NaN значений для координат
    if (
      (key === 'x' || key === 'y' || key === 'z') &&
      (typeof template[key] !== 'number' || isNaN(template[key]))
    ) {
      template[key] = 0
    }
  }
  return template
}
