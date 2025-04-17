import { type FC, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { mean } from 'd3'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { UseGraphData } from '@/components/hooks/main/useGraphData.ts'
import { Line2Type, useThickLine } from '@/components/hooks/3d/useThickLine.ts'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { NodeType } from '@/components/types/graph.ts'
import { useGlobal } from '@/components/hooks/3d/useGlobal.ts'
// import { useSphericalLayout } from '@/components/hooks/3d/useSphericalLayout.ts'

export interface Node3D extends NodeType {
  join: Node3D[]
  mesh3D?: THREE.Mesh // сфера
  label3D?: HTMLDivElement // подпись
}

interface Link3D {
  source: Node3D
  target: Node3D
  line3D?: THREE.Line | Line2Type
}
interface Graph3DProps {
  graphUse: UseGraphData
  onEditNode: (node: Node3D) => void
  searchQuery?: string[]
}

const Graph3D: FC<Graph3DProps> = ({ onEditNode, graphUse, searchQuery }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const width = useRef(window.innerWidth)
  const height = useRef(window.innerHeight)
  const resolution = new THREE.Vector2(width.current, height.current)
  const { createThickLine } = useThickLine(resolution, 5)

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)

  const scene = new THREE.Scene()
  sceneRef.current = scene

  const camera = new THREE.PerspectiveCamera(75, width.current / height.current, 0.1, 1000)
  camera.aspect = width.current / height.current
  cameraRef.current = camera
  const initialCameraPos = useRef<THREE.Vector3>(null)
  const initialCameraTarget = useRef<THREE.Vector3>(null)

  const renderer = new THREE.WebGLRenderer({ alpha: true })
  renderer.setClearColor(0x000000, 0) // делаем фон прозрачным
  renderer.setSize(width.current, height.current)
  rendererRef.current = renderer

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
    }

    if (containerRef.current) {
      containerRef.current.style.position = 'relative'
      containerRef.current.appendChild(renderer.domElement)
    }

    // const updatedData = useSphericalLayout(graphUse.graphData)
    // graphUse.setGraphData(updatedData)

    const nodes: Node3D[] = graphUse.graphData.nodes
    const links: Link3D[] = graphUse.graphData.links

    nodes.forEach((n) => {
      const geometry = new THREE.SphereGeometry(n.size, 16, 16)
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(n.color),
      })
      const sphere = new THREE.Mesh(geometry, material)

      sphere.position.set(n.x, n.y, n.z)
      sphere.userData = { node: n }
      n.mesh3D = sphere
      scene.add(sphere)

      // Подпись (label) внутри контейнера
      const div = document.createElement('div')
      div.className = 'nodelabel'
      div.textContent = n.name
      div.style.position = 'absolute'
      div.style.color = 'black'
      div.style.fontSize = '14px'
      div.style.translate = '-50%'

      n.label3D = div
      containerRef.current?.appendChild(div)
    })

    const useControls = () => {
      const controls = new OrbitControls(camera, renderer.domElement)
      controlsRef.current = controls
      const centerX = mean(nodes, (n) => n.x) || 0
      const centerY = mean(nodes, (n) => n.y) || 0
      const desiredZ = +useGlobal().parse().DEFAULT_ZOOM_3D
      if (!initialCameraPos.current || !initialCameraTarget.current) {
        initialCameraPos.current = camera.position.set(centerX, centerY, desiredZ)
        initialCameraTarget.current = controls.target.set(centerX, centerY, 0)
      } else {
        camera.position.copy(initialCameraPos.current)
        controls.target.copy(initialCameraTarget.current)
      }
      controls.update()

      function resetCamera() {
        if (!(initialCameraPos.current && initialCameraTarget.current)) return
        camera.position.copy(initialCameraPos.current)
        controls.target.copy(initialCameraTarget.current)
        controls.update()
        renderer.render(scene, camera)
      }

      return { controls, resetCamera }
    }
    const { controls, resetCamera } = useControls()

    const onResize = () => {
      width.current = window.innerWidth
      height.current = window.innerHeight
      camera.aspect = width.current / height.current
      camera.updateProjectionMatrix()
      renderer.setSize(width.current, height.current)
      resolution.set(width.current, height.current)
      render()
    }

    window.addEventListener('resize', onResize)

    if (!searchQuery?.length) {
      resetCamera()
    }

    links.forEach((link) => {
      const points = [
        new THREE.Vector3(link.source.x, link.source.y, link.source.z),
        new THREE.Vector3(link.target.x, link.target.y, link.target.z),
      ]
      const thickLine = createThickLine(points)
      link.line3D = thickLine
      scene.add(thickLine)
    })

    const useRaycaster = () => {
      // === Добавление взаимодействия с нодами через Raycaster ===
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
          onEditNode(clickedNode)
        }
      }
      const onMouseMove = (event: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect()
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObjects(
          nodes.map((n) => n.mesh3D).filter(Boolean) as THREE.Object3D[],
        )
        if (intersects.length > 0) {
          const hoveredNode = intersects[0].object.userData.node as Node3D
          links.forEach((link: Link3D) => {
            const material = link?.line3D?.material as LineMaterial
            if (!material) return

            if (link.source.id === hoveredNode.id || link.target.id === hoveredNode.id) {
              material.color.set(0xffa500)
            } else {
              material.color.set(0x999999)
            }
          })
        } else {
          links.forEach((link: Link3D) => {
            const material = link?.line3D?.material as LineMaterial
            if (!material) return
            material.color.set(0x999999)
          })
        }
      }
      return { onClick, onMouseMove }
    }
    const { onClick, onMouseMove } = useRaycaster()

    let lastLabelUpdate = 0
    const labelUpdateInterval = +useGlobal().parse().LABEL_UPDATE_INTERVAL
    function updateLabels() {
      const now = Date.now()
      if (now - lastLabelUpdate < labelUpdateInterval) return
      lastLabelUpdate = now

      nodes.forEach((n) => {
        if (!(n.label3D && n.mesh3D)) return
        const pos = new THREE.Vector3()
        n.mesh3D.getWorldPosition(pos)
        pos.project(camera)
        const screenX = (pos.x * 0.5 + 0.5) * width.current
        const screenY = (-pos.y * 0.5 + 0.5) * height.current
        if (screenX < 0 || screenX > width.current || screenY < 0 || screenY > height.current) {
          n.label3D.style.display = 'none'
          return
        }
        if (n.label3D.style.display === 'none') {
          n.label3D.style.display = ''
        }
        const offset = n.size + 4
        const zIndex = Math.floor((1 - pos.z) * 100000)

        n.label3D.style.left = `${screenX}px`
        n.label3D.style.top = `${screenY + offset}px`
        n.label3D.style.zIndex = `${zIndex}`
      })
    }
    const updateLines = () => {
      links.forEach((link) => {
        if (!(link.line3D && link.source.mesh3D && link.target.mesh3D)) return

        link.source.mesh3D.updateMatrixWorld()
        link.target.mesh3D.updateMatrixWorld()
        const sourcePos = new THREE.Vector3()
        const targetPos = new THREE.Vector3()
        link.source.mesh3D.getWorldPosition(sourcePos)
        link.target.mesh3D.getWorldPosition(targetPos)

        const newPositions: number[] = [sourcePos, targetPos].flatMap((p) => [p.x, p.y, p.z])
        const geometry = link.line3D.geometry as LineGeometry
        geometry.setPositions(newPositions)
        geometry.attributes.position.needsUpdate = true
      })
    }

    const render = () => {
      updateLabels()
      updateLines()
      renderer.render(scene, camera)
    }

    const rendererClick = (event: MouseEvent) => {
      onClick(event)
      render()
    }
    const rendererMouseMove = (event: MouseEvent) => {
      onMouseMove(event)
      render()
    }

    renderer.domElement.addEventListener('click', rendererClick)
    renderer.domElement.addEventListener('mousemove', rendererMouseMove)

    controls.addEventListener('change', render)
    render()

    return () => {
      window.removeEventListener('resize', onResize)
      renderer.domElement.removeEventListener('click', rendererClick)
      renderer.domElement.removeEventListener('mousemove', rendererMouseMove)
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
      nodes.forEach((n) => {
        if (n.label3D) {
          containerRef.current?.removeChild(n.label3D)
        }
      })
    }
  }, [onEditNode, graphUse.graphData, createThickLine, searchQuery])

  useEffect(() => {
    if (
      !searchQuery ||
      !Array.isArray(searchQuery) ||
      searchQuery.length === 0 ||
      !cameraRef.current ||
      !controlsRef.current ||
      !sceneRef.current ||
      !rendererRef.current
    )
      return

    const nodes: Node3D[] = graphUse.graphData.nodes
    const queries = searchQuery.map((q) => q.toLowerCase())

    // Узел подходит, если для каждого запроса существует семейство, содержащее этот запрос
    const targetNode = nodes.find((n) =>
      queries.every(
        (q) => n.family.some((f) => f.includes(q)) || n.anchor.some((a) => a.includes(q)),
      ),
    )

    if (targetNode) {
      cameraRef.current.position.set(targetNode.x, targetNode.y, targetNode.z + 200)
      controlsRef.current.target.set(targetNode.x, targetNode.y, targetNode.z)
      controlsRef.current.update()
      rendererRef.current.render(sceneRef.current, cameraRef.current)
    }
  }, [searchQuery, graphUse.graphData])

  return (
    <div
      id='threeContainer'
      ref={containerRef}
      style={{
        display: 'block',
        width: `${width.current}px`,
        height: `${height.current}px`,
        position: 'relative',
        overflow: 'hidden',
      }}
    ></div>
  )
}

export default Graph3D
