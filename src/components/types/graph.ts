export interface NodeType {
  id: number
  x: number
  y: number
  z: number
  fx?: number | null
  fy?: number | null
  name: string
  family: string[] // Семейство
  anchor: string[] // Якорь для привязки (binding)
  binding: string[] // Привязка к узлу с указанными якорями
  color: string
  notes: string[]
  join: NodeType[]
  joinLength?: number
  size: number | 5
  isCentral: boolean
}

export interface GraphData<N = NodeType> {
  nodes: N[]
  links: any[]
}
