import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

type PilotBuildingSceneProps = {
  variant: string
  floors: number
  projectName: string
}

function addBox(
  parent: THREE.Group,
  size: [number, number, number],
  position: [number, number, number],
  material: THREE.Material,
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material)
  mesh.position.set(...position)
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

function addTree(parent: THREE.Group, x: number, z: number, scale: number, foliage: THREE.Material) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035 * scale, 0.05 * scale, 0.42 * scale, 6),
    new THREE.MeshStandardMaterial({ color: '#755d3b', roughness: 0.9 }),
  )
  trunk.position.set(x, 0.21 * scale, z)
  trunk.castShadow = true
  parent.add(trunk)

  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25 * scale, 1), foliage)
  crown.position.set(x, 0.53 * scale, z)
  crown.castShadow = true
  parent.add(crown)
}

function addBuilding(
  parent: THREE.Group,
  options: {
    x: number
    z: number
    width: number
    depth: number
    floors: number
    floorHeight: number
    glass: THREE.Material
    structure: THREE.Material
    roof: THREE.Material
    accent: THREE.Material
    plantedRoof?: boolean
  },
) {
  const { x, z, width, depth, floors, floorHeight, glass, structure, roof, accent, plantedRoof } = options
  const height = floors * floorHeight
  const building = new THREE.Group()
  building.position.set(x, 0, z)
  parent.add(building)

  addBox(building, [width, height, depth], [0, height / 2, 0], glass)

  for (let floor = 0; floor < floors; floor += 1) {
    const y = floor * floorHeight + 0.045
    addBox(building, [width + 0.07, 0.075, depth + 0.07], [0, y, 0], structure)

    const windowWidth = Math.max(0.12, (width - 0.22) / 5)
    for (let column = 0; column < 5; column += 1) {
      const windowX = -width / 2 + 0.12 + windowWidth * (column + 0.5)
      const windowMaterial = (floor + column) % 5 === 0 ? accent : glass
      addBox(building, [windowWidth * 0.73, floorHeight * 0.43, 0.018], [windowX, y + floorHeight * 0.52, depth / 2 + 0.012], windowMaterial)
      addBox(building, [0.018, floorHeight * 0.43, windowWidth * 0.73], [width / 2 + 0.012, y + floorHeight * 0.52, -depth / 2 + 0.12 + windowWidth * (column + 0.5)], windowMaterial)
    }

    if (floor > 0 && floor % 2 === 0) {
      addBox(building, [width + 0.1, 0.035, 0.26], [0, y + 0.13, depth / 2 + 0.1], structure)
    }
  }

  addBox(building, [width + 0.2, 0.14, depth + 0.2], [0, height + 0.07, 0], roof)

  if (plantedRoof) {
    const planterMaterial = new THREE.MeshStandardMaterial({ color: '#86b65e', roughness: 0.88 })
    for (let index = 0; index < 4; index += 1) {
      addBox(building, [0.24, 0.12, 0.2], [-width * 0.35 + index * width * 0.23, height + 0.2, 0], planterMaterial)
    }
  } else {
    const solarMaterial = new THREE.MeshStandardMaterial({ color: '#4b82a1', metalness: 0.35, roughness: 0.38, emissive: '#14334a', emissiveIntensity: 0.25 })
    for (let index = 0; index < 3; index += 1) {
      const panel = addBox(building, [width * 0.22, 0.025, depth * 0.54], [-width * 0.29 + index * width * 0.29, height + 0.17, 0], solarMaterial)
      panel.rotation.x = -0.12
    }
  }
}

export function PilotBuildingScene({ variant, floors, projectName }: PilotBuildingSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [sceneError, setSceneError] = useState('')

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    } catch {
      setSceneError('Visualisasi 3D tidak tersedia pada browser atau perangkat ini.')
      return
    }

    setSceneError('')
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.setSize(host.clientWidth, host.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.setAttribute('aria-hidden', 'true')
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, host.clientWidth / host.clientHeight, 0.1, 100)
    camera.position.set(7.4, 6.2, 9.2)
    camera.lookAt(0, 1.25, 0)

    scene.add(new THREE.HemisphereLight('#d9f2d1', '#17251d', 2.2))
    const keyLight = new THREE.DirectionalLight('#efffd7', 3)
    keyLight.position.set(5, 9, 6)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(512, 512)
    scene.add(keyLight)
    const fillLight = new THREE.PointLight('#78c7d0', 24, 14)
    fillLight.position.set(-4, 3, -2)
    scene.add(fillLight)

    const model = new THREE.Group()
    scene.add(model)

    const palette = variant === 'surabaya-park'
      ? { glass: '#8b7966', frame: '#d8ad78', roof: '#f0c78e', accent: '#e7d6a5', foliage: '#a2b678', water: '#658e91' }
      : variant === 'transit-village'
        ? { glass: '#568e99', frame: '#93d2cf', roof: '#a7e1d6', accent: '#d1efcf', foliage: '#94bf70', water: '#46adc0' }
        : { glass: '#648b78', frame: '#aad57b', roof: '#cae995', accent: '#e3f0bc', foliage: '#a0cb6e', water: '#5aaab4' }

    const glass = new THREE.MeshPhysicalMaterial({
      color: palette.glass,
      metalness: 0.42,
      roughness: 0.22,
      transmission: 0.12,
      transparent: true,
      opacity: 0.92,
      emissive: palette.glass,
      emissiveIntensity: 0.12,
    })
    const structure = new THREE.MeshStandardMaterial({ color: '#24372c', metalness: 0.2, roughness: 0.66 })
    const roof = new THREE.MeshStandardMaterial({ color: palette.roof, metalness: 0.32, roughness: 0.4 })
    const accent = new THREE.MeshStandardMaterial({ color: palette.accent, emissive: palette.accent, emissiveIntensity: 0.32, roughness: 0.3 })
    const foliage = new THREE.MeshStandardMaterial({ color: palette.foliage, roughness: 0.82 })

    const site = new THREE.Mesh(
      new THREE.BoxGeometry(9.5, 0.18, 6.6),
      new THREE.MeshStandardMaterial({ color: '#24352b', roughness: 0.92 }),
    )
    site.position.y = -0.11
    site.receiveShadow = true
    model.add(site)

    const pathMaterial = new THREE.MeshStandardMaterial({ color: '#687a67', roughness: 0.82 })
    addBox(model, [0.7, 0.035, 4.4], [0.1, 0.005, 1.03], pathMaterial)
    addBox(model, [4.9, 0.035, 0.34], [-1.3, 0.008, 1.55], pathMaterial)

    const water = new THREE.Mesh(
      new THREE.BoxGeometry(1.75, 0.035, 0.92),
      new THREE.MeshPhysicalMaterial({ color: palette.water, metalness: 0.22, roughness: 0.16, transparent: true, opacity: 0.83 }),
    )
    water.position.set(2.35, 0.012, 1.5)
    model.add(water)

    const floorCount = Math.max(3, Math.min(10, floors))
    if (variant === 'surabaya-park') {
      addBuilding(model, { x: -1.9, z: -0.65, width: 2.35, depth: 1.55, floors: floorCount, floorHeight: 0.32, glass, structure, roof, accent })
      addBuilding(model, { x: 1.1, z: -0.95, width: 2.05, depth: 1.3, floors: Math.max(3, floorCount - 1), floorHeight: 0.32, glass, structure, roof, accent, plantedRoof: true })
      addBuilding(model, { x: -0.3, z: -2.35, width: 1.85, depth: 1.1, floors: Math.max(3, floorCount - 2), floorHeight: 0.32, glass, structure, roof, accent, plantedRoof: true })
    } else if (variant === 'transit-village') {
      addBuilding(model, { x: -0.1, z: -0.95, width: 1.42, depth: 1.28, floors: floorCount, floorHeight: 0.37, glass, structure, roof, accent })
      addBuilding(model, { x: -2.25, z: -0.7, width: 1.12, depth: 1.08, floors: Math.max(3, floorCount - 1), floorHeight: 0.35, glass, structure, roof, accent, plantedRoof: true })
      addBuilding(model, { x: 2.05, z: -0.55, width: 1.1, depth: 0.98, floors: Math.max(3, floorCount - 2), floorHeight: 0.34, glass, structure, roof, accent, plantedRoof: true })
      addBuilding(model, { x: -1.2, z: -2.35, width: 1.35, depth: 1, floors: 3, floorHeight: 0.32, glass, structure, roof, accent, plantedRoof: true })
      addBuilding(model, { x: 1.15, z: -2.25, width: 1.35, depth: 1, floors: 4, floorHeight: 0.32, glass, structure, roof, accent })
    } else {
      addBuilding(model, { x: 0, z: -0.85, width: 2.15, depth: 1.72, floors: floorCount, floorHeight: 0.42, glass, structure, roof, accent })
      addBuilding(model, { x: -2.2, z: -1.65, width: 1.02, depth: 1.1, floors: 3, floorHeight: 0.34, glass, structure, roof, accent, plantedRoof: true })
    }

    const treePositions: [number, number, number][] = [
      [-3.75, 1.8, 0.85], [-3.45, -2.5, 0.72], [3.6, -2.4, 0.82],
      [3.75, 0.15, 0.68], [-2.4, 2.45, 0.56], [2.3, 2.4, 0.62],
    ]
    treePositions.forEach(([x, z, scale]) => addTree(model, x, z, scale, foliage))

    const ringMaterial = new THREE.MeshBasicMaterial({ color: palette.accent, transparent: true, opacity: 0.36 })
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(3.65, 0.012, 5, 120), ringMaterial)
    orbit.rotation.x = Math.PI / 2
    orbit.position.y = 0.08
    model.add(orbit)
    model.rotation.y = -0.28

    let frameId = 0
    let lastFrame = 0
    let pointerDown = false
    let previousX = 0
    let rotationVelocity = 0
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resizeObserver = new ResizeObserver(() => {
      const width = host.clientWidth
      const height = host.clientHeight
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    })
    resizeObserver.observe(host)

    const onPointerDown = (event: PointerEvent) => {
      pointerDown = true
      previousX = event.clientX
      renderer.domElement.setPointerCapture(event.pointerId)
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!pointerDown) return
      rotationVelocity = (event.clientX - previousX) * 0.009
      model.rotation.y += rotationVelocity
      previousX = event.clientX
    }
    const onPointerUp = () => { pointerDown = false }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        model.rotation.y += event.key === 'ArrowLeft' ? -0.2 : 0.2
      }
    }
    const onContextLost = (event: Event) => {
      event.preventDefault()
      setSceneError('Visualisasi 3D terhenti. Muat ulang halaman untuk mencoba kembali.')
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('pointerup', onPointerUp)
    renderer.domElement.addEventListener('pointercancel', onPointerUp)
    renderer.domElement.addEventListener('webglcontextlost', onContextLost)
    host.addEventListener('keydown', onKeyDown)

    const animate = (time: number) => {
      frameId = window.requestAnimationFrame(animate)
      if (time - lastFrame < 1000 / 30) return
      lastFrame = time
      if (!pointerDown) {
        if (!reduceMotion) model.rotation.y += 0.002
        rotationVelocity *= 0.94
        model.rotation.y += rotationVelocity
      }
      renderer.render(scene, camera)
    }
    frameId = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      renderer.domElement.removeEventListener('pointercancel', onPointerUp)
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
      host.removeEventListener('keydown', onKeyDown)
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach(material => material.dispose())
        }
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [floors, projectName, variant])

  return <div className="pilot-three-canvas" ref={hostRef} role="img" aria-label={`Visualisasi konsep 3D interaktif ${projectName}. Gunakan tombol panah kiri dan kanan atau geser untuk memutar.`} tabIndex={0}>
    {sceneError && <div className="pilot-three-fallback" role="status">{sceneError}</div>}
    <span className="pilot-three-hint" aria-hidden="true">DRAG / PANAH UNTUK MEMUTAR</span>
  </div>
}
