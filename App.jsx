import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import * as THREE from "three";
import { Check, X, ChevronRight, RotateCcw, Plane, ClipboardList, Award } from "lucide-react";

/* ============================================================
   FONTS
============================================================ */
const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
    .font-display { font-family: 'Oswald', sans-serif; }
    .font-mono { font-family: 'IBM Plex Mono', monospace; }
    .font-body { font-family: 'IBM Plex Sans', sans-serif; }
  `}</style>
);

/* ============================================================
   PALETTE
============================================================ */
const C = {
  navy: "#0A1F2E",
  ink: "#06141F",
  line: "#8FA8B8",
  lineDim: "#3E5567",
  amber: "#FF9E1B",
  steel: "#7A93A3",
  parchment: "#EFE7D8",
  good: "#4ADE80",
  bad: "#F87171",
};

/* ============================================================
   PART DATA
============================================================ */
const EXTERIOR = [
  { id: "radome", name: "Radome" },
  { id: "cockpit_windows", name: "Flight Deck Windows" },
  { id: "fuselage", name: "Fuselage" },
  { id: "wing", name: "Wing" },
  { id: "winglet", name: "Winglet" },
  { id: "aileron", name: "Aileron" },
  { id: "flap", name: "Flap" },
  { id: "engine_nacelle", name: "Engine Nacelle" },
  { id: "horiz_stab", name: "Horizontal Stabilizer" },
  { id: "elevator", name: "Elevator" },
  { id: "vert_stab", name: "Vertical Stabilizer" },
  { id: "rudder", name: "Rudder" },
  { id: "nose_gear", name: "Nose Landing Gear" },
  { id: "main_gear", name: "Main Landing Gear" },
];

const ENGINE = [
  { id: "spinner", name: "Spinner", cx: 120, cy: 160, r: 20 },
  { id: "fan_blades", name: "Fan Blades", cx: 175, cy: 160, r: 45 },
  { id: "fan_cowl", name: "Fan Cowl / Inlet", cx: 140, cy: 160, r: 58 },
  { id: "compressor", name: "Compressor", cx: 310, cy: 160, r: 38 },
  { id: "combustor", name: "Combustion Chamber", cx: 425, cy: 160, r: 38 },
  { id: "turbine", name: "Turbine", cx: 540, cy: 160, r: 38 },
  { id: "exhaust_nozzle", name: "Exhaust Nozzle", cx: 715, cy: 160, r: 42 },
  { id: "nacelle", name: "Nacelle", cx: 260, cy: 96, r: 20 },
  { id: "thrust_reverser", name: "Thrust Reverser", cx: 610, cy: 96, r: 20 },
  { id: "pylon", name: "Pylon Mount", cx: 395, cy: 52, r: 20 },
];

const COCKPIT = [
  { id: "overhead_panel", name: "Overhead Panel", cx: 450, cy: 65, r: 58 },
  { id: "glareshield", name: "Glareshield", cx: 450, cy: 125, r: 58 },
  { id: "pfd", name: "Primary Flight Display", cx: 330, cy: 222, r: 52 },
  { id: "nd", name: "Navigation Display", cx: 490, cy: 222, r: 52 },
  { id: "mcp", name: "Mode Control Panel", cx: 450, cy: 112, r: 17 },
  { id: "center_pedestal", name: "Center Pedestal", cx: 450, cy: 375, r: 52 },
  { id: "throttle_levers", name: "Throttle Levers", cx: 450, cy: 325, r: 20 },
  { id: "control_yoke", name: "Control Yoke", cx: 430, cy: 270, r: 34 },
  { id: "rudder_pedals", name: "Rudder Pedals", cx: 450, cy: 460, r: 42 },
  { id: "circuit_breaker_panel", name: "Circuit Breaker Panel", cx: 775, cy: 270, r: 65 },
];

const SYSTEMS = [
  { id: "hyd_reservoir", name: "Hydraulic Reservoir", cx: 105, cy: 75, r: 32, group: "HYDRAULIC" },
  { id: "hyd_pump", name: "Hydraulic Pump", cx: 105, cy: 140, r: 24, group: "HYDRAULIC" },
  { id: "hyd_accumulator", name: "Accumulator", cx: 80, cy: 235, r: 28, group: "HYDRAULIC" },
  { id: "hyd_selector_valve", name: "Selector Valve", cx: 160, cy: 220, r: 20, group: "HYDRAULIC" },
  { id: "hyd_actuator", name: "Hydraulic Actuator", cx: 120, cy: 332, r: 36, group: "HYDRAULIC" },
  { id: "elec_generator", name: "Generator", cx: 440, cy: 90, r: 26, group: "ELECTRICAL" },
  { id: "elec_battery", name: "Battery", cx: 435, cy: 170, r: 26, group: "ELECTRICAL" },
  { id: "elec_bus_bar", name: "Bus Bar", cx: 445, cy: 227, r: 18, group: "ELECTRICAL" },
  { id: "elec_tr_unit", name: "Transformer Rectifier", cx: 445, cy: 282, r: 26, group: "ELECTRICAL" },
  { id: "elec_circuit_breaker", name: "Circuit Breaker", cx: 445, cy: 342, r: 18, group: "ELECTRICAL" },
  { id: "fuel_tank", name: "Fuel Tank", cx: 770, cy: 85, r: 42, group: "FUEL" },
  { id: "fuel_boost_pump", name: "Boost Pump", cx: 730, cy: 160, r: 22, group: "FUEL" },
  { id: "fuel_filter", name: "Fuel Filter", cx: 785, cy: 165, r: 18, group: "FUEL" },
  { id: "fuel_manifold", name: "Fuel Manifold", cx: 770, cy: 226, r: 28, group: "FUEL" },
  { id: "fuel_quantity_probe", name: "Fuel Quantity Probe", cx: 713, cy: 88, r: 13, group: "FUEL" },
];

const CATEGORIES = [
  { id: "exterior", label: "EXTERIOR", parts: EXTERIOR, is3d: true },
  { id: "engine", label: "ENGINE", parts: ENGINE },
  { id: "cockpit", label: "COCKPIT", parts: COCKPIT },
  { id: "systems", label: "SYSTEMS", parts: SYSTEMS },
];

/* ============================================================
   2D HIGHLIGHT OVERLAY (shared by engine/cockpit/systems)
============================================================ */
function HighlightOverlay({ part, viewW, viewH }) {
  if (!part) return null;
  const { cx, cy, r } = part;
  let by = cy - r - 22;
  if (by < 24) by = cy + r + 22;
  if (by > viewH - 16) by = cy - r - 22;
  let bx = Math.min(Math.max(cx, 40), viewW - 40);

  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 10} fill="none" stroke={C.amber} strokeWidth="2.5" strokeDasharray="6 5">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${cx} ${cy}`}
          to={`360 ${cx} ${cy}`}
          dur="18s"
          repeatCount="indefinite"
        />
      </circle>
      <line x1={cx} y1={cy} x2={bx} y2={by} stroke={C.amber} strokeWidth="1.5" />
      <circle cx={bx} cy={by} r="14" fill={C.ink} stroke={C.amber} strokeWidth="2" />
      <text x={bx} y={by + 4} textAnchor="middle" fontSize="13" fontFamily="'IBM Plex Mono', monospace" fill={C.amber} fontWeight="700">
        ?
      </text>
    </g>
  );
}

/* ============================================================
   2D DIAGRAMS (engine / cockpit / systems)
============================================================ */
function EngineDiagram({ highlightId }) {
  const part = ENGINE.find((p) => p.id === highlightId);
  return (
    <svg viewBox="0 0 900 300" className="w-full h-full">
      <g fill="none" stroke={C.line} strokeWidth="2">
        <path d="M100,160 C105,110 160,90 250,88 L650,88 C720,90 760,110 800,140 L800,180 C760,210 720,230 650,232 L250,232 C160,230 105,210 100,160 Z" />
        <ellipse cx="120" cy="160" rx="18" ry="30" />
        <circle cx="175" cy="160" r="42" strokeDasharray="3 4" />
        <ellipse cx="140" cy="160" rx="14" ry="66" />
        <polygon points="270,125 355,135 355,185 270,195" />
        <rect x="385" y="120" width="85" height="80" rx="18" />
        <polygon points="495,135 580,125 580,195 495,185" />
        <polygon points="650,138 800,160 650,182" />
        <rect x="230" y="88" width="90" height="12" />
        <rect x="565" y="88" width="90" height="12" />
        <polygon points="378,88 415,88 400,42 373,42" />
      </g>
      <HighlightOverlay part={part} viewW={900} viewH={300} />
    </svg>
  );
}

function CockpitDiagram({ highlightId }) {
  const part = COCKPIT.find((p) => p.id === highlightId);
  return (
    <svg viewBox="0 0 900 500" className="w-full h-full">
      <g fill="none" stroke={C.line} strokeWidth="2">
        <rect x="250" y="25" width="400" height="70" rx="8" />
        <rect x="200" y="108" width="500" height="30" rx="4" />
        <rect x="400" y="102" width="100" height="22" rx="3" />
        <rect x="262" y="168" width="136" height="108" rx="6" />
        <rect x="422" y="168" width="136" height="108" rx="6" />
        <circle cx="430" cy="270" r="32" strokeDasharray="3 4" />
        <rect x="390" y="298" width="120" height="150" rx="6" />
        <rect x="410" y="308" width="80" height="28" rx="3" />
        <rect x="388" y="450" width="60" height="26" rx="3" />
        <rect x="452" y="450" width="60" height="26" rx="3" />
        <rect x="705" y="150" width="145" height="240" rx="6" />
      </g>
      <HighlightOverlay part={part} viewW={900} viewH={500} />
    </svg>
  );
}

function SystemsDiagram({ highlightId }) {
  const part = SYSTEMS.find((p) => p.id === highlightId);
  return (
    <svg viewBox="0 0 900 420" className="w-full h-full">
      <g fill="none" stroke={C.lineDim} strokeWidth="1.5">
        <line x1="220" y1="20" x2="220" y2="400" strokeDasharray="4 4" />
        <line x1="560" y1="20" x2="560" y2="400" strokeDasharray="4 4" />
      </g>
      <text x="110" y="20" textAnchor="middle" fontSize="14" fill={C.steel} fontFamily="'IBM Plex Mono', monospace" letterSpacing="2">HYDRAULIC</text>
      <text x="440" y="20" textAnchor="middle" fontSize="14" fill={C.steel} fontFamily="'IBM Plex Mono', monospace" letterSpacing="2">ELECTRICAL</text>
      <text x="750" y="20" textAnchor="middle" fontSize="14" fill={C.steel} fontFamily="'IBM Plex Mono', monospace" letterSpacing="2">FUEL</text>
      <g fill="none" stroke={C.line} strokeWidth="2">
        <rect x="60" y="45" width="90" height="50" rx="4" />
        <circle cx="105" cy="140" r="24" />
        <rect x="60" y="205" width="40" height="65" rx="4" />
        <polygon points="160,198 182,220 160,242 138,220" />
        <rect x="60" y="312" width="120" height="26" rx="6" />
        <line x1="105" y1="95" x2="105" y2="116" />
        <line x1="105" y1="164" x2="105" y2="200" />
        <line x1="105" y1="270" x2="105" y2="312" />
        <circle cx="440" cy="90" r="26" />
        <rect x="400" y="150" width="70" height="40" rx="4" />
        <rect x="390" y="220" width="110" height="12" />
        <rect x="400" y="258" width="90" height="46" rx="4" />
        <rect x="415" y="332" width="60" height="22" rx="3" />
        <line x1="440" y1="116" x2="440" y2="150" />
        <line x1="440" y1="190" x2="440" y2="220" />
        <line x1="440" y1="232" x2="440" y2="258" />
        <line x1="440" y1="304" x2="440" y2="332" />
        <rect x="700" y="48" width="140" height="70" rx="4" />
        <circle cx="730" cy="160" r="20" />
        <rect x="770" y="147" width="30" height="38" rx="4" />
        <rect x="690" y="214" width="160" height="12" />
        <rect x="708" y="55" width="6" height="56" fill={C.line} />
        <line x1="730" y1="118" x2="730" y2="140" />
        <line x1="785" y1="118" x2="785" y2="147" />
        <line x1="770" y1="185" x2="770" y2="214" />
      </g>
      <HighlightOverlay part={part} viewW={900} viewH={420} />
    </svg>
  );
}

/* ============================================================
   3D EXTERIOR MODEL
============================================================ */
const BASE_HEX = 0x5c7a93;
const AMBER_HEX = 0xff9e1b;

function buildAircraft(scene, partMeshes) {
  const baseMat = () => new THREE.MeshStandardMaterial({ color: BASE_HEX, metalness: 0.25, roughness: 0.65 });
  const windowMat = () => new THREE.MeshStandardMaterial({ color: 0x0a1420, metalness: 0.1, roughness: 0.3 });
  const gearMat = () => new THREE.MeshStandardMaterial({ color: 0x3e5567, metalness: 0.4, roughness: 0.5 });
  const wheelMat = () => new THREE.MeshStandardMaterial({ color: 0x111820, metalness: 0.1, roughness: 0.85 });

  function addPart(id, geo, mat, pos, rot) {
    const mesh = new THREE.Mesh(geo, mat);
    if (pos) mesh.position.set(pos[0], pos[1], pos[2]);
    if (rot) mesh.rotation.set(rot[0], rot[1], rot[2]);
    mesh.userData.origColor = mat.color.clone();
    if (!partMeshes[id]) partMeshes[id] = [];
    partMeshes[id].push(mesh);
    scene.add(mesh);
    return mesh;
  }

  const fuseGeo = new THREE.CylinderGeometry(0.85, 0.85, 7.2, 20);
  fuseGeo.rotateX(Math.PI / 2);
  addPart("fuselage", fuseGeo, baseMat(), [0, 0, 0]);

  const noseGeo = new THREE.ConeGeometry(0.85, 1.3, 20);
  noseGeo.rotateX(Math.PI / 2);
  addPart("radome", noseGeo, baseMat(), [0, 0, 4.25]);

  const tailGeo = new THREE.ConeGeometry(0.85, 1.0, 20);
  tailGeo.rotateX(-Math.PI / 2);
  const tailMesh = new THREE.Mesh(tailGeo, baseMat());
  tailMesh.position.set(0, 0, -4.1);
  scene.add(tailMesh);

  addPart("cockpit_windows", new THREE.BoxGeometry(0.9, 0.32, 0.55), windowMat(), [0, 0.55, 3.1]);

  addPart("wing", new THREE.BoxGeometry(7.2, 0.14, 1.5), baseMat(), [0, -0.15, 0.1]);

  [-1, 1].forEach((s) => {
    addPart("winglet", new THREE.BoxGeometry(0.12, 0.9, 0.6), baseMat(), [3.6 * s, 0.35, 0.1], [0, 0, 0.15 * s]);
  });

  [-1, 1].forEach((s) => {
    addPart("aileron", new THREE.BoxGeometry(1.0, 0.08, 0.35), baseMat(), [2.7 * s, -0.15, -0.8]);
  });

  [-1, 1].forEach((s) => {
    addPart("flap", new THREE.BoxGeometry(1.1, 0.08, 0.4), baseMat(), [1.3 * s, -0.15, -0.8]);
  });

  [-1, 1].forEach((s) => {
    const geo = new THREE.CylinderGeometry(0.4, 0.4, 1.6, 14);
    geo.rotateX(Math.PI / 2);
    addPart("engine_nacelle", geo, baseMat(), [1.8 * s, -0.75, 0.2]);
  });

  addPart("horiz_stab", new THREE.BoxGeometry(2.6, 0.12, 0.9), baseMat(), [0, 0.15, -3.5]);
  addPart("elevator", new THREE.BoxGeometry(2.6, 0.08, 0.3), baseMat(), [0, 0.15, -3.95]);
  addPart("vert_stab", new THREE.BoxGeometry(0.12, 1.6, 1.0), baseMat(), [0, 1.0, -3.6]);
  addPart("rudder", new THREE.BoxGeometry(0.1, 1.6, 0.3), baseMat(), [0, 1.0, -4.05]);

  {
    const strutGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8);
    addPart("nose_gear", strutGeo, gearMat(), [0, -1.05, 2.6]);
    const wheelGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.18, 14);
    wheelGeo.rotateZ(Math.PI / 2);
    addPart("nose_gear", wheelGeo, wheelMat(), [0, -1.5, 2.6]);
  }

  [-1, 1].forEach((s) => {
    const strutGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.0, 8);
    addPart("main_gear", strutGeo, gearMat(), [1.0 * s, -1.1, -0.1]);
    const wheelGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.2, 14);
    wheelGeo.rotateZ(Math.PI / 2);
    addPart("main_gear", wheelGeo, wheelMat(), [1.0 * s, -1.65, -0.1]);
  });

  const grid = new THREE.GridHelper(16, 16, 0x2a3f4e, 0x1a2a36);
  grid.position.y = -1.85;
  scene.add(grid);
}

function Aircraft3D({ highlightId }) {
  const containerRef = useRef(null);
  const partMeshesRef = useRef({});
  const highlightedRef = useRef([]);
  const thetaRef = useRef(0.9);
  const phiRef = useRef(1.15);
  const radiusRef = useRef(12.5);
  const draggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const animIdRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06141f);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);
    renderer.domElement.style.cursor = "grab";
    renderer.domElement.style.touchAction = "none";

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x8fb0c9, 0.35);
    fillLight.position.set(-6, 3, -4);
    scene.add(fillLight);

    buildAircraft(scene, partMeshesRef.current);

    function updateCamera() {
      const theta = thetaRef.current;
      const phi = phiRef.current;
      const r = radiusRef.current;
      camera.position.x = r * Math.sin(phi) * Math.sin(theta);
      camera.position.y = r * Math.cos(phi);
      camera.position.z = r * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);
    }

    function resize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    function onPointerDown(e) {
      draggingRef.current = true;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      renderer.domElement.style.cursor = "grabbing";
    }
    function onPointerMove(e) {
      if (!draggingRef.current) return;
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      thetaRef.current -= dx * 0.007;
      phiRef.current = Math.min(Math.PI - 0.35, Math.max(0.35, phiRef.current - dy * 0.007));
    }
    function onPointerUp() {
      draggingRef.current = false;
      renderer.domElement.style.cursor = "grab";
    }
    function onWheel(e) {
      e.preventDefault();
      radiusRef.current = Math.min(22, Math.max(6.5, radiusRef.current + e.deltaY * 0.012));
    }
    const el = renderer.domElement;
    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    function animate() {
      animIdRef.current = requestAnimationFrame(animate);
      if (!draggingRef.current) thetaRef.current += 0.0022;
      updateCamera();
      const t = performance.now() * 0.004;
      const pulse = 0.45 + 0.35 * Math.sin(t);
      highlightedRef.current.forEach((m) => {
        m.material.emissiveIntensity = pulse;
      });
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(animIdRef.current);
      ro.disconnect();
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("wheel", onWheel);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      partMeshesRef.current = {};
    };
  }, []);

  useEffect(() => {
    const map = partMeshesRef.current;
    highlightedRef.current.forEach((m) => {
      m.material.color.copy(m.userData.origColor);
      m.material.emissive.setHex(0x000000);
      m.material.emissiveIntensity = 0;
    });
    const meshes = map[highlightId] || [];
    meshes.forEach((m) => {
      m.material.color.setHex(AMBER_HEX);
      m.material.emissive = new THREE.Color(AMBER_HEX);
      m.material.emissiveIntensity = 0.5;
    });
    highlightedRef.current = meshes;
  }, [highlightId]);

  return <div ref={containerRef} className="w-full h-full" />;
}

const DIAGRAM_COMPONENTS = {
  engine: EngineDiagram,
  cockpit: CockpitDiagram,
  systems: SystemsDiagram,
};

/* ============================================================
   HELPERS
============================================================ */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const partKey = (cat, id) => `${cat}:${id}`;
const STORAGE_KEY = "aircraft-parts-quiz-v2";
const NEEDED_STREAK = 2;

function pickPart(categoryId, progress, lastId) {
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  const pool = cat.parts;
  const uncertified = pool.filter((p) => !(progress[partKey(categoryId, p.id)] || {}).certified);
  let source = uncertified.length ? uncertified : pool;
  if (source.length > 1) {
    const filtered = source.filter((p) => p.id !== lastId);
    if (filtered.length) source = filtered;
  }
  return source[Math.floor(Math.random() * source.length)];
}

function buildQuestion(categoryId, progress, lastId) {
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  const pool = cat.parts;
  const answer = pickPart(categoryId, progress, lastId);
  const distractorPool = pool.filter((p) => p.id !== answer.id && p.name !== answer.name);
  const distractors = shuffle(distractorPool).slice(0, 3);
  const options = shuffle([answer, ...distractors]);
  return { categoryId, part: answer, options };
}

function certifiedCount(cat, progress, categoryId) {
  return cat.parts.filter((p) => (progress[partKey(categoryId, p.id)] || {}).certified).length;
}

/* ============================================================
   MAIN APP
============================================================ */
export default function App() {
  const [category, setCategory] = useState("exterior");
  const [progress, setProgress] = useState({});
  const [stats, setStats] = useState({});
  const [question, setQuestion] = useState(() => buildQuestion("exterior", {}, null));
  const [selected, setSelected] = useState(null);
  const [figNum, setFigNum] = useState(1);
  const [showLogbook, setShowLogbook] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const loadedProgress = parsed.progress || {};
        setProgress(loadedProgress);
        setStats(parsed.stats || {});
        setQuestion(buildQuestion("exterior", loadedProgress, null));
      }
    } catch (e) {
      /* no saved data yet */
    }
  }, []);

  const persist = useCallback((nextProgress, nextStats) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ progress: nextProgress, stats: nextStats }));
    } catch (e) {
      /* storage unavailable */
    }
  }, []);

  const changeCategory = (id) => {
    setCategory(id);
    setQuestion(buildQuestion(id, progress, null));
    setSelected(null);
    setFigNum((n) => n + 1);
    setShowLogbook(false);
  };

  const nextQuestion = () => {
    setQuestion(buildQuestion(category, progress, question.part.id));
    setSelected(null);
    setFigNum((n) => n + 1);
  };

  const answer = (opt) => {
    if (selected) return;
    setSelected(opt);
    const correct = opt.id === question.part.id;
    const k = partKey(category, question.part.id);
    const cur = progress[k] || { streak: 0, certified: false };
    const nextEntry = correct
      ? { streak: cur.streak + 1, certified: cur.certified || cur.streak + 1 >= NEEDED_STREAK }
      : { streak: 0, certified: cur.certified };
    const nextProgress = { ...progress, [k]: nextEntry };
    const [r, t] = stats[category] || [0, 0];
    const nextStats = { ...stats, [category]: [r + (correct ? 1 : 0), t + 1] };

    setProgress(nextProgress);
    setStats(nextStats);
    persist(nextProgress, nextStats);
  };

  const resetAll = () => {
    setProgress({});
    setStats({});
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ progress: {}, stats: {} }));
    } catch (e) {
      /* storage unavailable */
    }
    setQuestion(buildQuestion(category, {}, null));
    setSelected(null);
  };

  const currentCat = CATEGORIES.find((c) => c.id === category);
  const is3d = currentCat.is3d;
  const Diagram2D = DIAGRAM_COMPONENTS[category];

  const certCount = useMemo(() => certifiedCount(currentCat, progress, category), [progress, category, currentCat]);
  const totalInCat = currentCat.parts.length;
  const sectionCertified = certCount === totalInCat;

  const overall = useMemo(() => {
    const [r, t] = Object.values(stats).reduce((acc, [r2, t2]) => [acc[0] + r2, acc[1] + t2], [0, 0]);
    return { r, t, pct: t ? Math.round((r / t) * 100) : 0 };
  }, [stats]);

  const currentEntry = progress[partKey(category, question.part.id)] || { streak: 0, certified: false };
  const justCertified = selected && selected.id === question.part.id && currentEntry.certified && currentEntry.streak === NEEDED_STREAK;

  return (
    <div className="min-h-screen w-full" style={{ background: C.navy }}>
      <FontImport />
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-10">
        {/* HEADER */}
        <div className="flex items-start justify-between mb-6 border-b pb-4" style={{ borderColor: C.lineDim }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm flex items-center justify-center shrink-0" style={{ border: `2px solid ${C.amber}` }}>
              <Plane size={18} color={C.amber} />
            </div>
            <div>
              <h1 className="font-display text-xl md:text-2xl tracking-wide" style={{ color: C.parchment, letterSpacing: "0.03em" }}>
                AIRCRAFT PARTS
              </h1>
              <p className="font-mono text-[10px] md:text-xs" style={{ color: C.steel, letterSpacing: "0.15em" }}>
                ILLUSTRATED PARTS CATALOG — PRACTICE ED.
              </p>
            </div>
          </div>
          <div className="text-right font-mono">
            <div className="text-[10px]" style={{ color: C.steel }}>ACCURACY</div>
            <div className="text-lg font-semibold" style={{ color: overall.t ? C.amber : C.steel }}>
              {overall.t ? `${overall.pct}%` : "—"}
            </div>
            <div className="text-[10px]" style={{ color: C.lineDim }}>{overall.r}/{overall.t}</div>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex gap-1 mb-5 flex-wrap">
          {CATEGORIES.map((c) => {
            const active = c.id === category;
            const certN = certifiedCount(c, progress, c.id);
            const done = certN === c.parts.length;
            return (
              <button
                key={c.id}
                onClick={() => changeCategory(c.id)}
                className="font-mono text-xs px-3 py-2 rounded-sm transition-colors flex items-center gap-1.5"
                style={{
                  background: active ? C.amber : "transparent",
                  color: active ? C.ink : done ? C.good : C.steel,
                  border: `1px solid ${active ? C.amber : done ? C.good : C.lineDim}`,
                  fontWeight: active ? 700 : 500,
                  letterSpacing: "0.08em",
                }}
              >
                {done && <Check size={12} />}
                {c.label}
                <span style={{ opacity: 0.75, fontWeight: 400 }}>{certN}/{c.parts.length}</span>
              </button>
            );
          })}
        </div>

        {/* CERTIFIED BANNER */}
        {sectionCertified && (
          <div className="flex items-center gap-2 mb-4 px-4 py-2.5 rounded-sm font-mono text-xs" style={{ border: `1px solid ${C.good}`, color: C.good, letterSpacing: "0.08em" }}>
            <Award size={15} />
            {currentCat.label} SECTION CERTIFIED — ALL {totalInCat} ITEMS SIGNED OFF
          </div>
        )}

        {/* PLATE */}
        <div className="relative rounded-sm p-3 md:p-5 mb-3" style={{ background: C.ink, border: `1px solid ${C.lineDim}` }}>
          {[
            "-top-[1px] -left-[1px] border-t border-l",
            "-top-[1px] -right-[1px] border-t border-r",
            "-bottom-[1px] -left-[1px] border-b border-l",
            "-bottom-[1px] -right-[1px] border-b border-r",
          ].map((cls, i) => (
            <span key={i} className={`absolute w-4 h-4 ${cls}`} style={{ borderColor: C.amber }} />
          ))}

          <div className="aspect-[16/10] w-full">
            {is3d ? <Aircraft3D highlightId={question.part.id} /> : <Diagram2D highlightId={question.part.id} />}
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: C.lineDim }}>
            <span className="font-mono text-[10px] md:text-xs" style={{ color: C.steel, letterSpacing: "0.1em" }}>
              FIG. {String(figNum).padStart(3, "0")} — IDENTIFY THE MARKED ITEM
            </span>
            {question.part.group && (
              <span className="font-mono text-[10px]" style={{ color: C.lineDim }}>{question.part.group}</span>
            )}
          </div>
        </div>

        {is3d ? (
          <p className="font-mono text-[10px] text-center mb-5" style={{ color: C.lineDim, letterSpacing: "0.08em" }}>
            DRAG TO ROTATE • SCROLL TO ZOOM
          </p>
        ) : (
          <div className="mb-5" />
        )}

        {/* OPTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
          {question.options.map((opt, i) => {
            const letter = "ABCD"[i];
            const isSelected = selected && selected.id === opt.id;
            const isCorrectOpt = opt.id === question.part.id;
            let stateColor = C.lineDim;
            let bg = "transparent";
            if (selected) {
              if (isCorrectOpt) { stateColor = C.good; bg = "rgba(74, 222, 128, 0.08)"; }
              else if (isSelected) { stateColor = C.bad; bg = "rgba(248, 113, 113, 0.08)"; }
            }
            return (
              <button
                key={opt.id}
                onClick={() => answer(opt)}
                disabled={!!selected}
                className="flex items-center gap-3 px-4 py-3 rounded-sm text-left transition-colors font-body"
                style={{ border: `1px solid ${stateColor}`, background: bg, cursor: selected ? "default" : "pointer" }}
              >
                <span className="font-mono text-xs w-6 h-6 flex items-center justify-center rounded-sm shrink-0" style={{ border: `1px solid ${stateColor}`, color: stateColor }}>
                  {letter}
                </span>
                <span className="flex-1 text-sm" style={{ color: C.parchment }}>{opt.name}</span>
                {selected && isCorrectOpt && <Check size={16} color={C.good} />}
                {selected && isSelected && !isCorrectOpt && <X size={16} color={C.bad} />}
              </button>
            );
          })}
        </div>

        {/* FEEDBACK / NEXT */}
        <div className="flex items-center justify-between mb-8">
          <div className="font-mono text-xs" style={{ color: C.steel }}>
            {selected ? (
              selected.id === question.part.id ? (
                <span style={{ color: C.good }}>
                  CORRECT — {question.part.name.toUpperCase()}
                  {justCertified && " · CERTIFIED"}
                </span>
              ) : (
                <span style={{ color: C.bad }}>NOT QUITE — CORRECT: {question.part.name.toUpperCase()}</span>
              )
            ) : (
              <span>SELECT AN ANSWER</span>
            )}
          </div>
          {selected && (
            <button
              onClick={nextQuestion}
              className="font-mono text-xs px-4 py-2 rounded-sm flex items-center gap-1"
              style={{ background: C.amber, color: C.ink, fontWeight: 700, letterSpacing: "0.08em" }}
            >
              NEXT <ChevronRight size={14} />
            </button>
          )}
        </div>

        {/* LOGBOOK */}
        <div className="border rounded-sm" style={{ borderColor: C.lineDim }}>
          <button
            onClick={() => setShowLogbook((s) => !s)}
            className="w-full flex items-center justify-between px-4 py-3 font-mono text-xs"
            style={{ color: C.parchment, letterSpacing: "0.08em" }}
          >
            <span className="flex items-center gap-2"><ClipboardList size={14} color={C.amber} /> LOGBOOK — {currentCat.label}</span>
            <span style={{ color: C.steel }}>{certCount}/{totalInCat} CERTIFIED {showLogbook ? "▲" : "▼"}</span>
          </button>
          {showLogbook && (
            <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {currentCat.parts.map((p) => {
                const entry = progress[partKey(category, p.id)] || { streak: 0, certified: false };
                return (
                  <div key={p.id} className="flex items-center justify-between font-mono text-[11px] px-2.5 py-1.5 rounded-sm" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <span style={{ color: entry.certified ? C.parchment : C.steel }}>{p.name}</span>
                    {entry.certified ? (
                      <span className="flex items-center gap-1" style={{ color: C.good }}><Check size={12} /> CERT</span>
                    ) : entry.streak > 0 ? (
                      <span style={{ color: C.amber }}>{entry.streak}/{NEEDED_STREAK}</span>
                    ) : (
                      <span style={{ color: C.lineDim }}>—</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end mt-6 pt-4 border-t" style={{ borderColor: C.lineDim }}>
          <button onClick={resetAll} className="font-mono text-[10px] flex items-center gap-1 hover:opacity-80" style={{ color: C.steel }}>
            <RotateCcw size={11} /> RESET ALL PROGRESS
          </button>
        </div>
      </div>
    </div>
  );
}
