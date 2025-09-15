import { GraphData } from '@/components/types/graph.ts'
import { Node3D } from '@/components/Graph3D.tsx'

export const clearRecursiveToStringify = (data: GraphData<Node3D>) => {
  const removeRecursive: GraphData = { links: [], nodes: [] }
  removeRecursive.links = data.links.map((link) => {
    const computedLink = {
      ...link,
      source: {
        ...link.source,
        join: [],
        joinLength: link.source.join.length,
      },
      target: {
        ...link.target,
        join: [],
        joinLength: link.target.join.length,
      },
    }
    delete computedLink.source.mesh3D
    delete computedLink.target.mesh3D
    delete computedLink.source.label3D
    delete computedLink.target.label3D
    delete computedLink.line3D

    return computedLink
  })
  removeRecursive.nodes = data.nodes.map((node) => {
    const computedNode = {
      ...node,
      join: [],
      joinLength: node.join.length,
    }

    delete computedNode.mesh3D
    delete computedNode.mesh3D
    delete computedNode.label3D
    delete computedNode.label3D

    return computedNode
  })
  return Object.assign({}, removeRecursive)
}
