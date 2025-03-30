import { NodeType } from '@/components/types/graph.ts'

export const useNodeAdapter = (node: Partial<NodeType>) => {
  const template: NodeType = {
    id: +new Date(),
    x: 0,
    y: 0,
    z: 0,
    fx: null,
    fy: null,
    name: 'template',
    family: ['template'],
    color: '',
    notes: [],
    join: [],
    size: 5,
  }
  for (const key in node) {
    // @ts-ignore
    template[key] = node[key]
  }
  return template
}
