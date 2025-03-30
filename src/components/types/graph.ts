export interface NodeType {
  id: number
  x: number
  y: number
  z: number
  fx?: number | null
  fy?: number | null
  name: string
  family: string[]
  color: string
  notes: string[]
  join: NodeType[]
  size: number | 5
}

export interface GraphData<N = NodeType> {
  nodes: N[]
  links: any[]
}
