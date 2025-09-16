import { GraphData, NodeType } from '@/components/types/graph'

function createNode(data: any & object): NodeType {
  return {
    id: data.id,
    x: data.x,
    y: data.y,
    z: data.z,
    fx: data.fx || null,
    fy: data.fy || null,
    name: data.name,
    quality: data.quality || '',
    family: data.family,
    anchor: data.anchor,
    binding: data.binding,
    color: data.color,
    notes: data.notes,
    join: data.join,
    size: data.size,
    isCentral: data.isCentral,
  }
}

export function GraphDataAdapter(data: any & object): GraphData {
  if (!data?.nodes || !data?.links) {
    throw new Error('Неверная структура данных')
  }
  const nodes = data.nodes.map((node: any) => createNode(node))
  const links = Array.isArray(data.links) ? data.links : []
  return {
    nodes,
    links,
  }
}
