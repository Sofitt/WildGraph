import { GraphData, NodeType } from '@/components/types/graph'

export function createNode(data: any & object): NodeType {
  return {
    id: data.id,
    isCentral: data.isCentral || false,
    x: data.x || 0,
    y: data.y || 0,
    z: data.z || 0,
    fx: data.fx || null,
    fy: data.fy || null,
    name: data.name,
    quality: data.quality || '',
    family: data.family || [],
    anchor: data.anchor || [],
    binding: data.binding || [],
    color: data.color || '',
    notes: data.notes || [],
    join: data.join || [],
    size: data.size || 5,
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
