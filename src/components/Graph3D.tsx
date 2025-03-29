import { type FC, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { mean } from 'd3'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { UseGraphData } from '@/components/2d/useGraphData.ts'

export interface Node3D {
  z: number
  x: number
  y: number
  name: string
  family: string[]
  join: Node3D[]
  size: number
  mesh3D?: THREE.Mesh // сфера
  label3D?: HTMLDivElement // подпись
}

interface Link3D {
  source: Node3D
  target: Node3D
  line3D?: THREE.Line // линия
}
interface Graph3DProps {
  graphUse: UseGraphData
  onEditNode: (node: Node3D) => void
}

const Graph3D: FC<Graph3DProps> = ({ onEditNode, graphUse }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const width = 800
  const height = 600

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true })
    renderer.setClearColor(0x000000, 0) // делаем фон прозрачным
    renderer.setSize(width, height)
    if (containerRef.current) {
      containerRef.current.style.position = 'relative'
      containerRef.current.appendChild(renderer.domElement)
    }

    const controls = new OrbitControls(camera, renderer.domElement)

    const nodes: Node3D[] = graphUse.graphData.nodes
    const links: Link3D[] = graphUse.graphData.links

    const material = new THREE.MeshBasicMaterial({ color: THREE.Color.NAMES.red })
    nodes.forEach((n) => {
      const geometry = new THREE.SphereGeometry(n.size, 16, 16)
      const sphere = new THREE.Mesh(geometry, material)
      sphere.position.set(n.x, n.y, n.z)
      sphere.userData = { node: n }
      n.mesh3D = sphere
      scene.add(sphere)

      // Подпись (label) внутри контейнера
      const div = document.createElement('div')
      div.className = 'label'
      div.textContent = n.name
      div.style.position = 'absolute'
      div.style.color = 'black'
      div.style.fontSize = '14px'
      div.style.translate = '-50% 0'

      n.label3D = div
      containerRef.current?.appendChild(div)
    })

    const centerX = mean(nodes, (n) => n.x) || 0
    const centerY = mean(nodes, (n) => n.y) || 0
    const desiredZ = 300
    camera.position.set(centerX, centerY, desiredZ)
    controls.target.set(centerX, centerY, 0)
    controls.update()

    links.forEach((link) => {
      const material = new THREE.LineBasicMaterial({ color: THREE.Color.NAMES.blue })
      const points = [
        new THREE.Vector3(link.source.x, link.source.y, link.source.z),
        new THREE.Vector3(link.target.x, link.target.y, link.target.z),
      ]
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const line = new THREE.Line(geometry, material)
      link.line3D = line
      scene.add(line)
    })

    // === Добавление обработчика клика через Raycaster ===
    const useRaycaster = () => {
      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2()
      const onClick = (event: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect()
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
        raycaster.setFromCamera(mouse, camera)
        const objects = nodes.map((n) => n.mesh3D).filter(Boolean) as THREE.Object3D[]
        const intersects = raycaster.intersectObjects(objects)
        if (intersects.length > 0) {
          const clickedNode = intersects[0].object.userData.node as Node3D
          if (onEditNode) {
            onEditNode(clickedNode)
          }
        }
      }
      return { onClick }
    }
    const { onClick } = useRaycaster()
    renderer.domElement.addEventListener('click', onClick)

    function animate() {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)

      nodes.forEach((n) => {
        if (n.label3D && n.mesh3D) {
          if (n.label3D && n.mesh3D) {
            // Берём мировую позицию сферы
            const pos = new THREE.Vector3()
            n.mesh3D.getWorldPosition(pos)
            // Проецируем в экранные координаты
            pos.project(camera)
            const screenX = (pos.x * 0.5 + 0.5) * width
            const screenY = (-pos.y * 0.5 + 0.5) * height
            // Небольшое смещение вниз (чтобы подпись была под сферой)
            const offset = n.size + 4
            n.label3D.style.left = `${screenX}px`
            n.label3D.style.top = `${screenY + offset}px`
          }
        }
      })

      links.forEach((link) => {
        if (link.line3D && link.source.mesh3D && link.target.mesh3D) {
          link.source.mesh3D.updateMatrixWorld()
          link.target.mesh3D.updateMatrixWorld()

          const sourcePos = new THREE.Vector3()
          const targetPos = new THREE.Vector3()
          link.source.mesh3D.getWorldPosition(sourcePos)
          link.target.mesh3D.getWorldPosition(targetPos)

          // Достаём geometry линии
          const geometry = link.line3D.geometry as THREE.BufferGeometry
          // Берём массив координат
          const positions = geometry.attributes.position.array as Float32Array
          // Обновляем
          positions[0] = sourcePos.x
          positions[1] = sourcePos.y
          positions[2] = sourcePos.z
          positions[3] = targetPos.x
          positions[4] = targetPos.y
          positions[5] = targetPos.z
          // Сообщаем Three.js, что координаты обновились
          geometry.attributes.position.needsUpdate = true
        }
      })
    }
    animate()

    return () => {
      renderer.domElement.removeEventListener('click', onClick)
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
      nodes.forEach((n) => {
        if (n.label3D) {
          containerRef.current?.removeChild(n.label3D)
        }
      })
    }
  }, [onEditNode, graphUse.graphData])

  return (
    <div
      id='threeContainer'
      ref={containerRef}
      style={{
        display: 'block',
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        overflow: 'hidden',
      }}
    ></div>
  )
}

export default Graph3D
