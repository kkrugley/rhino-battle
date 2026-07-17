import { useEffect, useRef, useState } from 'react'

interface Props {
  src: string
  alt?: string
  style?: React.CSSProperties
  autoRotate?: boolean
}

export default function ModelViewer({ src, style, autoRotate = true }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState('')
  const [info, setInfo] = useState('')

  useEffect(() => {
    if (!ref.current || !src) return
    let disposed = false
    const container = ref.current
    const w = container.clientWidth || 300
    const h = container.clientHeight || 200
    let renderer: any

    const run = async () => {
      const THREE = await import('three')

      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xe5e7eb)

      const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
      camera.position.set(2, 2, 2)

      renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(w, h)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      container.appendChild(renderer.domElement)

      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.1
      controls.autoRotate = autoRotate
      controls.autoRotateSpeed = 2
      controls.minDistance = 0.5
      controls.maxDistance = 20
      if (autoRotate) controls.target.set(0, 0, 0)

      const amb = new THREE.AmbientLight(0xffffff, 0.5)
      scene.add(amb)
      const dir = new THREE.DirectionalLight(0xffffff, 1)
      dir.position.set(1, 2, 1)
      scene.add(dir)
      const back = new THREE.DirectionalLight(0xffffff, 0.4)
      back.position.set(-1, -1, -1)
      scene.add(back)

      const ext = src.split('.').pop()?.toLowerCase() || ''
      try {
        let object: any
        if (ext === 'glb' || ext === 'gltf') {
          const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
          const gltf = await new Promise<any>((resolve, reject) =>
            new GLTFLoader().load(src, resolve, undefined, reject)
          )
          object = gltf.scene
          object.traverse((child: any) => {
            if (child.isMesh) {
              child.castShadow = true
              child.receiveShadow = true
            }
          })
        } else if (ext === 'stl') {
          const { STLLoader } = await import('three/examples/jsm/loaders/STLLoader.js')
          const loader = new STLLoader()
          const geom = await loader.loadAsync(src)
          if (!geom.attributes.position) throw new Error('STL has no position attribute')
          const verts = geom.attributes.position.count
          setInfo(`STL ${verts} verts`)
          const mat = new THREE.MeshStandardMaterial({
            color: 0x808080, metalness: 0.3, roughness: 0.4, side: THREE.DoubleSide,
          })
          object = new THREE.Mesh(geom, mat)
          object.castShadow = true
          object.receiveShadow = true
        } else if (ext === 'obj') {
          const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js')
          object = await new Promise<any>((resolve, reject) =>
            new OBJLoader().load(src, resolve, undefined, reject)
          )
          object.traverse((child: any) => {
            if (child.isMesh) {
              child.material = child.material || new THREE.MeshStandardMaterial({ color: 0x808080 })
              child.castShadow = true
              child.receiveShadow = true
            }
          })
        } else {
          setFailed('Unsupported format')
          return
        }

        const box = new THREE.Box3().setFromObject(object)
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z, 0.001)
        const scale = 2 / maxDim
        object.scale.setScalar(scale)

        const center = box.getCenter(new THREE.Vector3())
        object.position.copy(center.clone().negate().multiplyScalar(scale))

        scene.add(object)

        controls.fitToBox(new THREE.Box3().setFromObject(object), false)

        const animate = () => {
          if (disposed) return
          controls.update()
          renderer.render(scene, camera)
          requestAnimationFrame(animate)
        }
        animate()
      } catch (e) {
        console.error('ModelViewer error:', src, e)
        setFailed(String(e))
      }
    }

    run()

    return () => {
      disposed = true
      if (renderer) {
        renderer.dispose()
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement)
        }
      }
    }
  }, [src, autoRotate])

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...style, background: '#e5e7eb' }}>
      {info && !failed && <div style={{ position: 'absolute', top: 2, left: 2, color: '#c00', fontSize: 8, zIndex: 1 }}>{info}</div>}
      {failed && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#800000', fontSize: 11, padding: 4 }}>{failed}</div>}
    </div>
  )
}
