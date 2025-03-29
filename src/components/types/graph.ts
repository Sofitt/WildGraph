export interface NodeType {
  x: number
  y: number
  z: number
  fx?: number | null
  fy?: number | null
  name: string
  family: string[]
  join: NodeType[]
  size: number
}

export interface GraphData<N = NodeType> {
  nodes: N[]
  links: any[]
}
