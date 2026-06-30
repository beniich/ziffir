// src/components/dashboard/HotelMap3D.tsx
// ============================================================================
// Sovereign 3D Hotel Command Map — Three.js
// Named translucent-glass suites | Emissive point lights | Biometric pins
// Starfield particles | Orbit/Drag/Zoom | Camera reset | HTML labels
// ============================================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useSocket } from '../../hooks/useSocket';

// ---------------------------------------------------------------------------
// Props Interface
// ---------------------------------------------------------------------------
interface HotelMap3DProps {
  language: 'EN' | 'FR' | 'RU';
  lightScene: 'ambient' | 'bright' | 'relax' | 'night';
  glowingRooms: Record<string, boolean>;
  toggleRoomGlow: (room: string) => void;
  occupancyMap: Record<string, boolean>;
  setOccupancyMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  temperatureMap: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Suite Definitions — Sovereign Layout
// ---------------------------------------------------------------------------
interface SuiteDefinition {
  id: string;
  label: { EN: string; FR: string; RU: string };
  px: number; py: number; pz: number;
  sx: number; sy: number; sz: number;
  color: number;
  isCorridorType?: boolean;
}

const SUITES: SuiteDefinition[] = [
  {
    id: 'royal',
    label: { EN: 'Royal Suite', FR: 'Suite Royale', RU: 'Королевский Люкс' },
    px: -6, py: 1.5, pz: -3,
    sx: 4, sy: 3, sz: 4,
    color: 0xd4af37,
  },
  {
    id: 'imperial',
    label: { EN: 'Imperial Suite', FR: 'Suite Impériale', RU: 'Имперский Люкс' },
    px: 6, py: 1.5, pz: -3,
    sx: 4, sy: 3, sz: 4,
    color: 0x8b5cf6,
  },
  {
    id: 'prestige',
    label: { EN: 'Prestige Suite', FR: 'Suite Prestige', RU: 'Престиж Люкс' },
    px: -6, py: 1.5, pz: 4,
    sx: 4, sy: 3, sz: 4,
    color: 0x0ea5e9,
  },
  {
    id: 'boardroom',
    label: { EN: 'Boardroom', FR: 'Salle de Conférence', RU: 'Зал Совещаний' },
    px: 6, py: 1.5, pz: 4,
    sx: 4, sy: 3, sz: 4,
    color: 0xf97316,
  },
  {
    id: 'corridor',
    label: { EN: 'Grand Corridor', FR: 'Grand Couloir', RU: 'Парадный Коридор' },
    px: 0, py: 0.4, pz: 0.5,
    sx: 5, sy: 0.8, sz: 8,
    color: 0x34d399,
    isCorridorType: true,
  },
];

// ---------------------------------------------------------------------------
// Scene-based point light colors
// ---------------------------------------------------------------------------
const SCENE_LIGHT_COLOR: Record<string, number> = {
  ambient: 0xfff8e7,
  bright:  0xffffff,
  relax:   0x60a5fa,
  night:   0x1e3a8a,
};

const SCENE_LIGHT_INTENSITY: Record<string, number> = {
  ambient: 1.2,
  bright:  2.5,
  relax:   0.8,
  night:   0.3,
};

// ---------------------------------------------------------------------------
// Label state
// ---------------------------------------------------------------------------
interface LabelState {
  id: string;
  label: string;
  x: number;
  y: number;
  visible: boolean;
  isOccupied: boolean;
  isGlowing: boolean;
  temp: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function HotelMap3D({
  language,
  lightScene,
  glowingRooms,
  toggleRoomGlow,
  occupancyMap,
  setOccupancyMap,
  temperatureMap,
}: HotelMap3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const frameRef = useRef<number>(0);
  const clockRef = useRef(new THREE.Clock());

  const meshRefs = useRef<Map<string, THREE.Mesh>>(new Map());
  const pointLightRefs = useRef<Map<string, THREE.PointLight>>(new Map());
  const occupancyPinRefs = useRef<Map<string, THREE.Mesh>>(new Map());

  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const orbitRef = useRef({ theta: 0.4, phi: 0.35, radius: 26 });
  const autoRotateRef = useRef(true);
  const autoRotateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Prop refs to avoid stale closures
  const lightSceneRef = useRef(lightScene);
  const glowingRoomsRef = useRef(glowingRooms);
  const occupancyMapRef = useRef(occupancyMap);
  const temperatureMapRef = useRef(temperatureMap);
  const languageRef = useRef(language);

  const [labels, setLabels] = useState<LabelState[]>([]);

  useEffect(() => { lightSceneRef.current = lightScene; }, [lightScene]);
  useEffect(() => { glowingRoomsRef.current = glowingRooms; }, [glowingRooms]);
  useEffect(() => { occupancyMapRef.current = occupancyMap; }, [occupancyMap]);
  useEffect(() => { temperatureMapRef.current = temperatureMap; }, [temperatureMap]);
  useEffect(() => { languageRef.current = language; }, [language]);

  const { socket } = useSocket();

  const resetCamera = useCallback(() => {
    orbitRef.current = { theta: 0.4, phi: 0.35, radius: 26 };
    autoRotateRef.current = true;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const w = container.clientWidth || 800;
    const h = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04050a);
    scene.fog = new THREE.FogExp2(0x04050a, 0.02);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(48, w / h, 0.1, 300);
    camera.position.set(0, 14, 26);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambient = new THREE.AmbientLight(0x111122, 0.9);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xfff5d6, 1.8);
    sun.position.set(12, 22, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x4060aa, 0.5);
    fill.position.set(-15, 8, -12);
    scene.add(fill);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0b0c14, metalness: 0.9, roughness: 0.15 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    const grid = new THREE.GridHelper(50, 25, 0x1a1a2e, 0x0d0d1a);
    grid.position.y = 0.01;
    scene.add(grid);

    // Suite meshes
    SUITES.forEach((suite) => {
      const geo = new THREE.BoxGeometry(suite.sx, suite.sy, suite.sz);
      const mat = new THREE.MeshPhysicalMaterial({
        color: suite.color,
        emissive: suite.color,
        emissiveIntensity: 0.08,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.55,
        thickness: 1.2,
        transparent: true,
        opacity: suite.isCorridorType ? 0.35 : 0.55,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(suite.px, suite.py, suite.pz);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.suiteId = suite.id;
      scene.add(mesh);
      meshRefs.current.set(suite.id, mesh);

      // Edge wireframe
      const edgeGeo = new THREE.EdgesGeometry(geo);
      const edgeMat = new THREE.LineBasicMaterial({ color: suite.color, transparent: true, opacity: 0.45 });
      mesh.add(new THREE.LineSegments(edgeGeo, edgeMat));

      // Point light
      const light = new THREE.PointLight(suite.color, 1.2, 8, 2);
      light.position.set(suite.px, suite.py, suite.pz);
      scene.add(light);
      pointLightRefs.current.set(suite.id, light);

      // Biometric occupancy pin
      const pinGeo = new THREE.SphereGeometry(0.22, 14, 14);
      const pinMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.9 });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(suite.px, suite.py + suite.sy / 2 + 0.55, suite.pz);
      pin.visible = false;
      scene.add(pin);
      occupancyPinRefs.current.set(suite.id, pin);
    });

    // Starfield
    buildStarfield(scene);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();
      const t = clockRef.current.getElapsedTime();

      if (autoRotateRef.current) {
        orbitRef.current.theta += delta * 0.06;
      }

      const { theta, phi, radius } = orbitRef.current;
      const cx = radius * Math.sin(theta) * Math.cos(phi);
      const cy = radius * Math.sin(phi) + 4;
      const cz = radius * Math.cos(theta) * Math.cos(phi);
      camera.position.set(cx, Math.max(cy, 2), cz);
      camera.lookAt(0, 2, 0);

      const lColor = SCENE_LIGHT_COLOR[lightSceneRef.current] ?? 0xffffff;
      const lIntensity = SCENE_LIGHT_INTENSITY[lightSceneRef.current] ?? 1.0;

      SUITES.forEach((suite) => {
        const mesh = meshRefs.current.get(suite.id);
        const light = pointLightRefs.current.get(suite.id);
        const pin = occupancyPinRefs.current.get(suite.id);
        if (!mesh || !light) return;
        const mat = mesh.material as THREE.MeshPhysicalMaterial;
        const isGlowing = glowingRoomsRef.current[suite.id] ?? false;
        const isOccupied = occupancyMapRef.current[suite.id] ?? false;

        light.color.setHex(lColor);
        light.intensity = isGlowing
          ? lIntensity * 2.5 + 0.8 * Math.sin(t * 2.5)
          : lIntensity * 0.6;

        mat.emissiveIntensity = isGlowing
          ? 0.35 + 0.2 * Math.sin(t * 2.2)
          : 0.05;

        if (pin) {
          pin.visible = isOccupied;
          if (isOccupied) {
            const s = 1 + 0.18 * Math.sin(t * 4);
            pin.scale.setScalar(s);
            (pin.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.7 + 0.3 * Math.sin(t * 4);
          }
        }
      });

      renderer.render(scene, camera);

      // HTML label projection
      const canvas = renderer.domElement;
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      const nextLabels: LabelState[] = SUITES.map((suite) => {
        const mesh = meshRefs.current.get(suite.id);
        const worldPos = mesh
          ? new THREE.Vector3(suite.px, suite.py + suite.sy / 2 + 1.1, suite.pz)
          : new THREE.Vector3(suite.px, suite.py + 1.1, suite.pz);
        const ndc = worldPos.clone().project(camera);
        const x = ((ndc.x + 1) / 2) * cw;
        const y = ((-ndc.y + 1) / 2) * ch;
        return {
          id: suite.id,
          label: suite.label[languageRef.current] ?? suite.label.EN,
          x, y,
          visible: ndc.z < 1,
          isOccupied: occupancyMapRef.current[suite.id] ?? false,
          isGlowing: glowingRoomsRef.current[suite.id] ?? false,
          temp: temperatureMapRef.current[suite.id] ?? 21,
        };
      });
      setLabels(nextLabels);
    };
    animate();

    // Resize
    const onResize = () => {
      if (!containerRef.current) return;
      const w2 = containerRef.current.clientWidth;
      const h2 = containerRef.current.clientHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    };
    window.addEventListener('resize', onResize);

    // Drag / orbit
    const el = renderer.domElement;
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      autoRotateRef.current = false;
      if (autoRotateTimerRef.current) clearTimeout(autoRotateTimerRef.current);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      orbitRef.current.theta -= dx * 0.006;
      orbitRef.current.phi = Math.max(0.05, Math.min(1.2, orbitRef.current.phi + dy * 0.005));
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => {
      isDraggingRef.current = false;
      autoRotateTimerRef.current = setTimeout(() => { autoRotateRef.current = true; }, 4000);
    };

    // Scroll to zoom
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitRef.current.radius = Math.max(10, Math.min(55, orbitRef.current.radius + e.deltaY * 0.04));
    };

    // Click raycasting
    const raycaster = new THREE.Raycaster();
    const mouse2d = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouse2d.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse2d.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse2d, camera);
      const hits = raycaster.intersectObjects(Array.from(meshRefs.current.values()), false);
      if (hits.length > 0) {
        const sid = hits[0].object.userData.suiteId as string;
        if (sid) {
          toggleRoomGlow(sid);
          setOccupancyMap((prev) => ({ ...prev, [sid]: !prev[sid] }));
        }
      }
    };

    // Touch
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        lastMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        autoRotateRef.current = false;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - lastMouseRef.current.x;
      const dy = e.touches[0].clientY - lastMouseRef.current.y;
      orbitRef.current.theta -= dx * 0.006;
      orbitRef.current.phi = Math.max(0.05, Math.min(1.2, orbitRef.current.phi + dy * 0.005));
      lastMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => { isDraggingRef.current = false; };

    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('click', onClick);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(frameRef.current);
      if (autoRotateTimerRef.current) clearTimeout(autoRotateTimerRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('click', onClick);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('wheel', onWheel);
      renderer.dispose();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Socket.IO live updates
  useEffect(() => {
    if (!socket) return;
    const onSuiteUpdated = (payload: { roomId: string; state: { isOccupied?: boolean } }) => {
      if (payload.state?.isOccupied !== undefined) {
        setOccupancyMap((prev) => ({ ...prev, [payload.roomId]: payload.state.isOccupied! }));
      }
    };
    socket.on('suite:updated', onSuiteUpdated);
    return () => { socket.off('suite:updated', onSuiteUpdated); };
  }, [socket, setOccupancyMap]);

  // i18n
  const hints = {
    EN: { drag: 'Drag to orbit  •  Scroll to zoom  •  Click suite to toggle', reset: 'Reset View', occupied: 'Occupied', available: 'Available' },
    FR: { drag: 'Glisser pour orbiter  •  Molette pour zoomer  •  Clic pour activer', reset: 'Réinitialiser', occupied: 'Occupée', available: 'Disponible' },
    RU: { drag: 'Поворот  •  Колесо для зума  •  Клик для активации', reset: 'Сброс', occupied: 'Занято', available: 'Свободно' },
  }[language] ?? { drag: 'Drag • Scroll • Click', reset: 'Reset', occupied: 'Occupied', available: 'Available' };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '500px', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

      {/* Projected HTML Labels */}
      {labels.map((lbl) =>
        lbl.visible ? (
          <div
            key={lbl.id}
            onClick={() => { toggleRoomGlow(lbl.id); setOccupancyMap((p) => ({ ...p, [lbl.id]: !p[lbl.id] })); }}
            style={{
              position: 'absolute',
              left: lbl.x,
              top: lbl.y,
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'all',
              cursor: 'pointer',
              userSelect: 'none',
              zIndex: 10,
            }}
          >
            <div style={{
              background: lbl.isGlowing
                ? 'rgba(212,175,55,0.18)'
                : lbl.isOccupied ? 'rgba(34,197,94,0.14)' : 'rgba(4,5,12,0.78)',
              backdropFilter: 'blur(12px)',
              border: lbl.isGlowing
                ? '1px solid rgba(212,175,55,0.55)'
                : lbl.isOccupied ? '1px solid rgba(34,197,94,0.45)' : '1px solid rgba(255,255,255,0.10)',
              borderRadius: '10px',
              padding: '5px 10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              boxShadow: lbl.isGlowing ? '0 0 16px rgba(212,175,55,0.35)' : undefined,
              transition: 'all 0.3s ease',
            }}>
              <span style={{
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
                color: lbl.isGlowing ? '#d4af37' : lbl.isOccupied ? '#4ade80' : '#e5e7eb',
                whiteSpace: 'nowrap',
              }}>{lbl.label}</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '9px', fontFamily: 'monospace', color: lbl.isOccupied ? '#4ade80' : '#6b7280' }}>
                  {lbl.isOccupied ? `● ${hints.occupied}` : `○ ${hints.available}`}
                </span>
                <span style={{ fontSize: '9px', fontFamily: 'monospace', color: '#94a3b8' }}>
                  {lbl.temp.toFixed(1)}°C
                </span>
              </div>
            </div>
            <div style={{
              width: 0, height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: lbl.isGlowing
                ? '6px solid rgba(212,175,55,0.55)'
                : lbl.isOccupied ? '6px solid rgba(34,197,94,0.45)' : '6px solid rgba(255,255,255,0.10)',
              margin: '0 auto',
            }} />
          </div>
        ) : null
      )}

      {/* Legend */}
      <div style={{
        position: 'absolute', top: '14px', left: '14px',
        background: 'rgba(4,5,12,0.82)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
        padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '5px', zIndex: 20,
      }}>
        <span style={{ fontSize: '9px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>
          Suites
        </span>
        {SUITES.map((s) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '2px',
              backgroundColor: '#' + s.color.toString(16).padStart(6, '0'),
              boxShadow: '0 0 5px #' + s.color.toString(16).padStart(6, '0') + '88',
            }} />
            <span style={{ fontSize: '11px', color: '#d1d5db', whiteSpace: 'nowrap' }}>
              {s.label[language]}
            </span>
          </div>
        ))}
        <div style={{ marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            <span style={{ fontSize: '10px', color: '#9ca3af' }}>{hints.occupied}</span>
          </div>
          <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#d4af37', boxShadow: '0 0 6px #d4af37' }} />
            <span style={{ fontSize: '10px', color: '#9ca3af' }}>Active Glow</span>
          </div>
        </div>
      </div>

      {/* Camera Reset */}
      <button
        onClick={resetCamera}
        style={{
          position: 'absolute', top: '14px', right: '14px',
          background: 'rgba(4,5,12,0.82)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
          padding: '7px 14px', color: '#c19a6b', fontSize: '11px',
          fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer',
          transition: 'all 0.2s', zIndex: 20,
        }}
      >
        ↺ {hints.reset}
      </button>

      {/* Drag hint */}
      <div style={{
        position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(4,5,12,0.65)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px',
        padding: '5px 16px', fontSize: '10px', color: '#4b5563',
        letterSpacing: '0.04em', zIndex: 20, whiteSpace: 'nowrap',
      }}>
        🖱 {hints.drag}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Starfield helper
// ---------------------------------------------------------------------------
function buildStarfield(scene: THREE.Scene) {
  // Ambient dust (golden)
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(300 * 3);
  for (let i = 0; i < 300; i++) {
    dustPos[i * 3]     = (Math.random() - 0.5) * 60;
    dustPos[i * 3 + 1] = Math.random() * 20 + 1;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 60;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xd4af37, size: 0.06, transparent: true, opacity: 0.35, sizeAttenuation: true })));

  // Background stars (white)
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(500 * 3);
  for (let i = 0; i < 500; i++) {
    starPos[i * 3]     = (Math.random() - 0.5) * 200;
    starPos[i * 3 + 1] = Math.random() * 80 + 20;
    starPos[i * 3 + 2] = (Math.random() - 0.5) * 200;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.55, sizeAttenuation: true })));
}
