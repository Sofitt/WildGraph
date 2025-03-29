export interface NodeType {
  x: number
  y: number
  fx?: number | null
  fy?: number | null
  name: string
  family: string[]
  join: NodeType[]
  size: number
}

export interface GraphData {
  nodes: NodeType[]
  links: any[]
}
