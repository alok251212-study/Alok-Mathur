import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  RotateCcw,
  Maximize2,
  Eye,
  Layers,
  Sparkles,
  Info,
  Compass,
  Play,
  Pause,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

export type Fruit3DModelType = 'apple' | 'banana' | 'orange' | 'tomato' | 'carrot' | 'strawberry' | 'broccoli';

interface Viewer3DProps {
  initialFruit?: Fruit3DModelType;
  onModelChange?: (fruit: Fruit3DModelType) => void;
}

export const Viewer3D: React.FC<Viewer3DProps> = ({
  initialFruit = 'apple',
  onModelChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedFruit, setSelectedFruit] = useState<Fruit3DModelType>(initialFruit);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isCrossSection, setIsCrossSection] = useState<boolean>(false);
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [activeViewName, setActiveViewName] = useState<string>('Perspective');
  const [hudCollapsed, setHudCollapsed] = useState<boolean>(false);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const fruitGroupRef = useRef<THREE.Group | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const prevMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0.2, y: 0.3 });
  const currentRotationRef = useRef<{ x: number; y: number }>({ x: 0.2, y: 0.3 });
  const cameraDistanceRef = useRef<number>(4.2);
  const targetDistanceRef = useRef<number>(4.2);

  // Build Procedural 3D Fruit Mesh Hierarchy (THREE.Group with 3-12 parts)
  const buildFruitModel = (type: Fruit3DModelType, crossCut: boolean, wireframe: boolean) => {
    const group = new THREE.Group();
    group.name = 'HeroFruit';

    // Helper procedural canvas texture for skin stippling
    const makeStippledTexture = (baseHex: string, dotHex: string) => {
      const cvs = document.createElement('canvas');
      cvs.width = 256;
      cvs.height = 256;
      const ctx = cvs.getContext('2d')!;
      ctx.fillStyle = baseHex;
      ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = dotHex;
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const r = Math.random() * 1.5 + 0.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      const tex = new THREE.CanvasTexture(cvs);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(3, 3);
      return tex;
    };

    switch (type) {
      case 'apple': {
        // 1. Primary body: Apple shaped sphere with top & bottom indentations
        const bodyGeo = new THREE.SphereGeometry(
          1.15,
          48,
          48,
          0,
          crossCut ? Math.PI * 1.25 : Math.PI * 2
        );
        // Sculpt indentations on vertices
        const pos = bodyGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const y = pos.getY(i);
          const x = pos.getX(i);
          const z = pos.getZ(i);
          const distFromAxis = Math.sqrt(x * x + z * z);

          // Top indentation (stem cavity)
          if (y > 0.6) {
            const factor = Math.max(0, 1 - distFromAxis);
            pos.setY(i, y - factor * 0.35);
          }
          // Bottom indentation (calyx cavity)
          if (y < -0.6) {
            const factor = Math.max(0, 1 - distFromAxis);
            pos.setY(i, y + factor * 0.28);
          }
          // Slight shoulder bulge
          if (y > 0.1 && y < 0.7) {
            pos.setX(i, x * 1.08);
            pos.setZ(i, z * 1.08);
          }
        }
        bodyGeo.computeVertexNormals();

        const skinTex = makeStippledTexture('#b91c1c', '#facc15');
        const appleMat = new THREE.MeshPhysicalMaterial({
          color: 0xdc2626,
          map: skinTex,
          roughness: 0.18,
          metalness: 0.05,
          clearcoat: 0.6,
          clearcoatRoughness: 0.15,
          wireframe
        });
        const bodyMesh = new THREE.Mesh(bodyGeo, appleMat);
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        group.add(bodyMesh);

        // 2. Woody stem (curved tube)
        const stemCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0.7, 0),
          new THREE.Vector3(0.08, 1.1, 0.05),
          new THREE.Vector3(0.2, 1.45, 0.15)
        ]);
        const stemGeo = new THREE.TubeGeometry(stemCurve, 16, 0.045, 10, false);
        const stemMat = new THREE.MeshStandardMaterial({
          color: 0x4a2e18,
          roughness: 0.85,
          metalness: 0.0,
          wireframe
        });
        const stemMesh = new THREE.Mesh(stemGeo, stemMat);
        stemMesh.castShadow = true;
        group.add(stemMesh);

        // 3. Calyx sepals at the bottom
        const calyxGeo = new THREE.ConeGeometry(0.12, 0.18, 5);
        const calyxMat = new THREE.MeshStandardMaterial({
          color: 0x2e1d11,
          roughness: 0.9,
          wireframe
        });
        const calyxMesh = new THREE.Mesh(calyxGeo, calyxMat);
        calyxMesh.position.set(0, -1.02, 0);
        calyxMesh.rotation.x = Math.PI;
        group.add(calyxMesh);

        // 4. Cross section interior pulp and seeds if active
        if (crossCut) {
          const coreGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 16);
          const coreMat = new THREE.MeshStandardMaterial({
            color: 0xfef08a,
            roughness: 0.4,
            wireframe
          });
          const coreMesh = new THREE.Mesh(coreGeo, coreMat);
          group.add(coreMesh);

          // Seed
          const seedGeo = new THREE.SphereGeometry(0.08, 8, 8);
          seedGeo.scale(0.6, 1.4, 0.8);
          const seedMat = new THREE.MeshStandardMaterial({ color: 0x3e1f0e, roughness: 0.2 });
          const seedMesh1 = new THREE.Mesh(seedGeo, seedMat);
          seedMesh1.position.set(0.12, 0.05, 0.08);
          group.add(seedMesh1);
        }
        break;
      }

      case 'banana': {
        // Banana: curved extruded faceted body
        const bananaCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-1.3, -0.6, 0),
          new THREE.Vector3(-0.7, -0.1, 0),
          new THREE.Vector3(0, 0.15, 0),
          new THREE.Vector3(0.7, 0.0, 0),
          new THREE.Vector3(1.3, -0.5, 0)
        ]);

        const bananaGeo = new THREE.TubeGeometry(bananaCurve, 32, 0.32, 5, false);
        const bananaMat = new THREE.MeshPhysicalMaterial({
          color: 0xfacc15,
          roughness: 0.32,
          metalness: 0.02,
          clearcoat: 0.3,
          wireframe
        });
        const bananaMesh = new THREE.Mesh(bananaGeo, bananaMat);
        bananaMesh.castShadow = true;
        group.add(bananaMesh);

        // Stem end (greenish brown)
        const stemEndGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.35, 6);
        const stemEndMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.7 });
        const stemEnd = new THREE.Mesh(stemEndGeo, stemEndMat);
        stemEnd.position.set(-1.42, -0.75, 0);
        stemEnd.rotation.z = Math.PI / 4;
        group.add(stemEnd);

        // Blossom tip (dark brown)
        const tipGeo = new THREE.SphereGeometry(0.1, 8, 8);
        const tipMat = new THREE.MeshStandardMaterial({ color: 0x27190e, roughness: 0.9 });
        const tipMesh = new THREE.Mesh(tipGeo, tipMat);
        tipMesh.position.set(1.36, -0.55, 0);
        group.add(tipMesh);
        break;
      }

      case 'orange': {
        // Spherical flavedo with stippled citrus oil glands
        const orangeGeo = new THREE.SphereGeometry(
          1.15,
          48,
          48,
          0,
          crossCut ? Math.PI * 1.3 : Math.PI * 2
        );
        const orangeTex = makeStippledTexture('#ea580c', '#c2410c');
        const orangeMat = new THREE.MeshPhysicalMaterial({
          color: 0xf97316,
          map: orangeTex,
          roughness: 0.38,
          metalness: 0.03,
          clearcoat: 0.25,
          wireframe
        });
        const orangeMesh = new THREE.Mesh(orangeGeo, orangeMat);
        orangeMesh.castShadow = true;
        group.add(orangeMesh);

        // Calyx button (small green/brown star)
        const buttonGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.04, 6);
        const buttonMat = new THREE.MeshStandardMaterial({ color: 0x365314, roughness: 0.8 });
        const buttonMesh = new THREE.Mesh(buttonGeo, buttonMat);
        buttonMesh.position.set(0, 1.15, 0);
        group.add(buttonMesh);

        // Citrus segments cross section
        if (crossCut) {
          const pulpGeo = new THREE.CircleGeometry(1.1, 12);
          const pulpMat = new THREE.MeshStandardMaterial({
            color: 0xfb923c,
            roughness: 0.45,
            side: THREE.DoubleSide
          });
          const pulpMesh = new THREE.Mesh(pulpGeo, pulpMat);
          pulpMesh.rotation.y = Math.PI / 2;
          group.add(pulpMesh);
        }
        break;
      }

      case 'tomato': {
        // Plump tomato with slight 4-lobed variation
        const tomatoGeo = new THREE.SphereGeometry(
          1.1,
          48,
          48,
          0,
          crossCut ? Math.PI * 1.35 : Math.PI * 2
        );
        const pos = tomatoGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const y = pos.getY(i);
          const x = pos.getX(i);
          const z = pos.getZ(i);
          // slight top flattening
          if (y > 0.7) {
            pos.setY(i, y * 0.88);
          }
          // gentle 4-lobe expansion
          const angle = Math.atan2(z, x);
          const lobe = 1 + 0.05 * Math.sin(angle * 4);
          pos.setX(i, x * lobe);
          pos.setZ(i, z * lobe);
        }
        tomatoGeo.computeVertexNormals();

        const tomatoMat = new THREE.MeshPhysicalMaterial({
          color: 0xef4444,
          roughness: 0.12,
          metalness: 0.02,
          clearcoat: 0.85,
          clearcoatRoughness: 0.08,
          wireframe
        });
        const tomatoMesh = new THREE.Mesh(tomatoGeo, tomatoMat);
        tomatoMesh.castShadow = true;
        group.add(tomatoMesh);

        // 5-pointed Sepals star on top
        const sepalMat = new THREE.MeshStandardMaterial({
          color: 0x22c55e,
          roughness: 0.6,
          side: THREE.DoubleSide
        });
        for (let s = 0; s < 5; s++) {
          const sepalGeo = new THREE.ConeGeometry(0.14, 0.48, 4);
          const sepalMesh = new THREE.Mesh(sepalGeo, sepalMat);
          const angle = (s * Math.PI * 2) / 5;
          sepalMesh.position.set(Math.cos(angle) * 0.22, 1.02, Math.sin(angle) * 0.22);
          sepalMesh.rotation.x = Math.sin(angle) * 0.7 + Math.PI / 2;
          sepalMesh.rotation.z = -Math.cos(angle) * 0.7;
          group.add(sepalMesh);
        }

        // Green pedicel stem
        const pedicelGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.4, 8);
        const pedicelMesh = new THREE.Mesh(pedicelGeo, sepalMat);
        pedicelMesh.position.set(0, 1.2, 0);
        group.add(pedicelMesh);
        break;
      }

      case 'carrot': {
        // Tapered carrot body
        const carrotGeo = new THREE.ConeGeometry(0.55, 2.6, 32);
        carrotGeo.rotateX(Math.PI);
        const carrotMat = new THREE.MeshPhysicalMaterial({
          color: 0xf97316,
          roughness: 0.42,
          metalness: 0.02,
          clearcoat: 0.2,
          wireframe
        });
        const carrotMesh = new THREE.Mesh(carrotGeo, carrotMat);
        carrotMesh.castShadow = true;
        group.add(carrotMesh);

        // Green foliage shoots on top
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.65 });
        for (let l = 0; l < 6; l++) {
          const shootGeo = new THREE.CylinderGeometry(0.02, 0.04, 0.7, 6);
          const shootMesh = new THREE.Mesh(shootGeo, leafMat);
          const angle = (l * Math.PI * 2) / 6;
          shootMesh.position.set(Math.cos(angle) * 0.15, 1.5, Math.sin(angle) * 0.15);
          shootMesh.rotation.z = Math.cos(angle) * 0.35;
          shootMesh.rotation.x = Math.sin(angle) * 0.35;
          group.add(shootMesh);
        }
        break;
      }

      case 'strawberry': {
        // Inverted conical strawberry body
        const strawGeo = new THREE.ConeGeometry(0.9, 1.7, 32);
        strawGeo.rotateX(Math.PI);
        const strawMat = new THREE.MeshPhysicalMaterial({
          color: 0xdc2626,
          roughness: 0.22,
          clearcoat: 0.6,
          wireframe
        });
        const strawMesh = new THREE.Mesh(strawGeo, strawMat);
        strawMesh.castShadow = true;
        group.add(strawMesh);

        // Golden seed bumps
        const seedMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.3 });
        for (let i = 0; i < 35; i++) {
          const seedGeo = new THREE.SphereGeometry(0.035, 6, 6);
          const seed = new THREE.Mesh(seedGeo, seedMat);
          const y = -0.6 + Math.random() * 1.2;
          const radiusAtY = (0.9 * (1.7 - y)) / 1.7 * 0.85;
          const theta = Math.random() * Math.PI * 2;
          seed.position.set(Math.cos(theta) * radiusAtY, y, Math.sin(theta) * radiusAtY);
          group.add(seed);
        }

        // Green calyx leaves
        const crownMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });
        for (let c = 0; c < 6; c++) {
          const leafGeo = new THREE.ConeGeometry(0.15, 0.5, 4);
          const leafMesh = new THREE.Mesh(leafGeo, crownMat);
          const theta = (c * Math.PI * 2) / 6;
          leafMesh.position.set(Math.cos(theta) * 0.3, 0.9, Math.sin(theta) * 0.3);
          leafMesh.rotation.z = Math.cos(theta) * 0.8;
          group.add(leafMesh);
        }
        break;
      }

      case 'broccoli': {
        // Broccoli: Thick pale green stalk + multiple floret clusters
        const stalkGeo = new THREE.CylinderGeometry(0.35, 0.45, 1.4, 16);
        const stalkMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.7 });
        const stalkMesh = new THREE.Mesh(stalkGeo, stalkMat);
        stalkMesh.position.set(0, -0.3, 0);
        group.add(stalkMesh);

        // Top floret crown
        const floretMat = new THREE.MeshStandardMaterial({
          color: 0x15803d,
          roughness: 0.9,
          wireframe
        });
        const floretPositions = [
          [0, 0.65, 0, 0.65],
          [0.45, 0.55, 0.25, 0.45],
          [-0.45, 0.55, -0.2, 0.45],
          [0.1, 0.55, -0.45, 0.42],
          [-0.25, 0.55, 0.45, 0.42],
          [0.55, 0.35, -0.25, 0.38],
          [-0.55, 0.35, 0.25, 0.38]
        ];
        floretPositions.forEach(([x, y, z, r]) => {
          const fGeo = new THREE.DodecahedronGeometry(r, 2);
          const fMesh = new THREE.Mesh(fGeo, floretMat);
          fMesh.position.set(x, y, z);
          fMesh.castShadow = true;
          group.add(fMesh);
        });
        break;
      }
    }

    return group;
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Detect software gl
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x090d16);

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0.8, 4.2);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // Procedural Studio Environment Reflection
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch (e) {
      console.warn('RoomEnvironment skipped:', e);
    }

    // Studio Lighting Rig (3-point)
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.4);
    keyLight.position.set(4, 6, 5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0xecfeff, 0x0f172a, 1.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    rimLight.position.set(-4, -2, -4);
    scene.add(rimLight);

    // Ground Contact Shadow Disk
    const shadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const cvs = document.createElement('canvas');
    cvs.width = 128;
    cvs.height = 128;
    const ctx = cvs.getContext('2d')!;
    const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(cvs);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.35;
    scene.add(shadowMesh);

    // Add Initial Fruit Group
    const fruitGroup = buildFruitModel(selectedFruit, isCrossSection, wireframeMode);
    scene.add(fruitGroup);
    fruitGroupRef.current = fruitGroup;

    // Animation Loop with Smooth Exponential Damping
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();

      if (fruitGroupRef.current) {
        // Auto rotate if enabled and not currently dragging
        if (autoRotate && !isDraggingRef.current) {
          targetRotationRef.current.y += delta * 0.45;
        }

        // Smooth damping
        currentRotationRef.current.x = THREE.MathUtils.damp(
          currentRotationRef.current.x,
          targetRotationRef.current.x,
          10,
          delta
        );
        currentRotationRef.current.y = THREE.MathUtils.damp(
          currentRotationRef.current.y,
          targetRotationRef.current.y,
          10,
          delta
        );

        fruitGroupRef.current.rotation.x = currentRotationRef.current.x;
        fruitGroupRef.current.rotation.y = currentRotationRef.current.y;
      }

      // Smooth camera zoom
      if (cameraRef.current) {
        cameraDistanceRef.current = THREE.MathUtils.damp(
          cameraDistanceRef.current,
          targetDistanceRef.current,
          10,
          delta
        );
        cameraRef.current.position.z = cameraDistanceRef.current;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    // Mouse / Touch Drag Events for 360 Inspection
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      targetRotationRef.current.y += dx * 0.008;
      targetRotationRef.current.x += dy * 0.008;
      // Clamp vertical orbit
      targetRotationRef.current.x = Math.max(-1.4, Math.min(1.4, targetRotationRef.current.x));
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetDistanceRef.current = Math.max(2.2, Math.min(6.5, targetDistanceRef.current + e.deltaY * 0.003));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Handle Resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('mousedown', onMouseDown);
      dom.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, []);

  // Update fruit model when fruit, crossSection or wireframe changes
  useEffect(() => {
    if (!sceneRef.current) return;
    if (fruitGroupRef.current) {
      sceneRef.current.remove(fruitGroupRef.current);
    }
    const newGroup = buildFruitModel(selectedFruit, isCrossSection, wireframeMode);
    sceneRef.current.add(newGroup);
    fruitGroupRef.current = newGroup;
  }, [selectedFruit, isCrossSection, wireframeMode]);

  // View presets
  const setCameraPreset = (viewName: 'Front' | 'Side' | 'Top' | 'Reset') => {
    setActiveViewName(viewName);
    switch (viewName) {
      case 'Front':
        targetRotationRef.current = { x: 0.1, y: 0 };
        targetDistanceRef.current = 4.0;
        break;
      case 'Side':
        targetRotationRef.current = { x: 0.1, y: Math.PI / 2 };
        targetDistanceRef.current = 4.0;
        break;
      case 'Top':
        targetRotationRef.current = { x: Math.PI / 2 - 0.05, y: 0 };
        targetDistanceRef.current = 4.4;
        break;
      case 'Reset':
        targetRotationRef.current = { x: 0.2, y: 0.3 };
        targetDistanceRef.current = 4.2;
        break;
    }
  };

  const handleFruitSelect = (type: Fruit3DModelType) => {
    setSelectedFruit(type);
    if (onModelChange) onModelChange(type);
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col">
      {/* 3D Viewport Header */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-3 pointer-events-auto">
        <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-lg flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white tracking-wide uppercase">
            360° Studio Inspection: <span className="text-emerald-400 capitalize">{selectedFruit}</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
            {activeViewName}
          </span>
        </div>
      </div>

      {/* Quick Action Top-Right Bar */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 backdrop-blur-md transition-all ${
            autoRotate
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
              : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title="Toggle Auto Rotation"
        >
          {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{autoRotate ? 'Rotating' : 'Paused'}</span>
        </button>

        <button
          onClick={() => setCameraPreset('Reset')}
          className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 backdrop-blur-md transition-colors"
          title="Reset Camera View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Three.js Canvas Container (100% Unobstructed Center) */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
      />

      {/* Viewport Interaction Prompt */}
      <div className="absolute bottom-28 left-6 text-[11px] text-slate-500 font-mono pointer-events-none select-none">
        • Drag left/right/up to orbit 360° • Scroll wheel to zoom
      </div>

      {/* Collapsible Ergonomic Bottom Control Dock (Directive 5) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-4xl">
        <div className="flex flex-col items-center">
          {/* Collapse/Expand Toggle Button */}
          <button
            onClick={() => setHudCollapsed(!hudCollapsed)}
            className="mb-1 px-3 py-0.5 rounded-t-lg bg-slate-900/95 border-t border-x border-slate-700 text-[11px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            {hudCollapsed ? '▲ Show 3D Controls' : '▼ Hide Controls'}
          </button>

          {/* Unified Horizontal Glassmorphic Control Dock */}
          {!hudCollapsed && (
            <div className="w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-3 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
              {/* Fruit Selector Tabs */}
              <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {(['apple', 'banana', 'orange', 'tomato', 'carrot', 'strawberry', 'broccoli'] as Fruit3DModelType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => handleFruitSelect(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                      selectedFruit === f
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Camera Angle Presets */}
              <div className="flex items-center space-x-1 border-l border-slate-800 pl-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 hidden sm:inline">Views:</span>
                {(['Front', 'Side', 'Top'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setCameraPreset(v)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      activeViewName === v
                        ? 'bg-slate-700 text-emerald-400 font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              {/* Feature Toggles (Cross Section, Wireframe, Zoom) */}
              <div className="flex items-center space-x-2 border-l border-slate-800 pl-3">
                <button
                  onClick={() => setIsCrossSection(!isCrossSection)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all ${
                    isCrossSection
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  title="Cut open cross-section to inspect inner pulp and seed structure"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Cross-Section</span>
                </button>

                <button
                  onClick={() => setWireframeMode(!wireframeMode)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all ${
                    wireframeMode
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  title="Toggle wireframe topology inspection"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Wireframe</span>
                </button>

                <div className="flex items-center space-x-1 ml-1">
                  <button
                    onClick={() => (targetDistanceRef.current = Math.max(2.2, targetDistanceRef.current - 0.4))}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => (targetDistanceRef.current = Math.min(6.5, targetDistanceRef.current + 0.4))}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
