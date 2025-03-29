import { GraphData } from '@/components/types/graph.ts'

export const clearRecursiveToStringify = (data: GraphData) => {
  const removeRecursive = structuredClone(data)
  removeRecursive.links = removeRecursive.links.map((link) => {
    return {
      ...link,
      source: {
        ...link.source,
        join: [],
      },
      target: {
        ...link.target,
        join: [],
      },
    }
  })
  removeRecursive.nodes = removeRecursive.nodes.map((node) => ({
    ...node,
    join: [],
  }))
  return removeRecursive
}
