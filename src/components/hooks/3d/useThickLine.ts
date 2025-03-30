import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'

export type Line2Type = Line2

export function useThickLine(
  resolution: THREE.Vector2,
  thickness: number = 5,
  color: number = 0x999999,
) {
  const createThickLine = (points: THREE.Vector3[]): Line2Type => {
    const positions: number[] = []
    points.forEach((p) => {
      positions.push(p.x, p.y, p.z)
    })
    const geometry = new LineGeometry()
    geometry.setPositions(positions)
    const material = new LineMaterial({
      color: color,
      linewidth: thickness, // толщина в пикселях
      resolution: resolution, // обязательно передавать разрешение
      // можно добавить дополнительные настройки, например, alphaTest
    })
    const line = new Line2(geometry, material)
    line.computeLineDistances()
    return line
  }

  return { createThickLine }
}
