// Ground Floor Planner — editable 3D model driven by plan.json.
//
// Plan coordinates (mm): x runs left->right along the front of the house,
// y runs from the front of the house towards the back. In three.js the plan
// point (x, y) at height h is placed at (x, h, -y) in metres.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CATALOG, ITEM_TYPES } from './catalog.js';
import { buildItem } from './items.js';

const S = 0.001;
const STORAGE_KEY = 'ground-floor-plan.v2';
const SNAP = 50;
const CUTAWAY_HEIGHT = 1000;

const $ = (s) => document.querySelector(s);
const view = $('#view');
const statusEl = $('#status');

// ---------------------------------------------------------------- state
let plan = null;
let selection = null; // { kind: 'item' | 'opening' | 'wall', id }
let wallsCut = false;
const history = [];

// ---------------------------------------------------------------- three.js setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
view.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#e9edf1');
scene.add(new THREE.HemisphereLight('#ffffff', '#8a8f99', 1.7));
const sun = new THREE.DirectionalLight('#ffffff', 1.6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -0.0005;
scene.add(sun, sun.target);

const persp = new THREE.PerspectiveCamera(50, 1, 0.05, 300);
const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 300);
ortho.up.set(0, 0, -1); // so +y in the plan points up the screen
let camera = persp;
let controls = makeControls(camera);

function makeControls(cam) {
  const c = new OrbitControls(cam, renderer.domElement);
  c.enableDamping = true;
  c.zoomToCursor = true;
  if (cam === ortho) {
    c.enableRotate = false;
    c.screenSpacePanning = true;
    c.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
  } else {
    c.maxPolarAngle = Math.PI / 2 - 0.02;
  }
  return c;
}

const root = new THREE.Group();
scene.add(root);
const objects = new Map(); // "kind:id" -> Object3D
const pickables = [];
let selectionHelper = null;

const wallMat = new THREE.MeshStandardMaterial({ color: '#f4f1ea', roughness: 0.9 });
const doorMat = new THREE.MeshStandardMaterial({ color: '#b8875a', roughness: 0.7 });
const glassMat = new THREE.MeshStandardMaterial({ color: '#9fd3ff', transparent: true, opacity: 0.35, roughness: 0.1 });
const pickMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
const arcMat = new THREE.LineBasicMaterial({ color: '#8a6a4a' });
const floorMat = new THREE.MeshStandardMaterial({ color: '#d9c7a7', roughness: 0.95 });
const floorMats = new Map();
function floorMaterial(color) {
  if (!color) return floorMat;
  if (!floorMats.has(color)) floorMats.set(color, new THREE.MeshStandardMaterial({ color, roughness: 0.95 }));
  return floorMats.get(color);
}

// ---------------------------------------------------------------- plan helpers
const getItem = (id) => plan.items.find((i) => i.id === id);
const getWall = (id) => plan.walls.find((w) => w.id === id);
const getOpening = (id) => plan.openings.find((o) => o.id === id);
const openingsOn = (wallId) => plan.openings.filter((o) => o.wall === wallId);

function wallFrame(w) {
  const dx = w.b[0] - w.a[0], dy = w.b[1] - w.a[1];
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L, uy = dy / L;
  return { L, ux, uy, nx: -uy, ny: ux, angle: Math.atan2(dy, dx) };
}

function bounds() {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const w of plan.walls) {
    for (const p of [w.a, w.b]) {
      const t = w.thickness / 2;
      minX = Math.min(minX, p[0] - t); maxX = Math.max(maxX, p[0] + t);
      minY = Math.min(minY, p[1] - t); maxY = Math.max(maxY, p[1] + t);
    }
  }
  if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 5000; maxY = 5000; }
  return { minX, minY, maxX, maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, w: maxX - minX, h: maxY - minY };
}

function newId(prefix, list) {
  let n = list.length + 1;
  while (list.some((x) => x.id === prefix + n)) n++;
  return prefix + n;
}

const snap = (v, step) => Math.round(v / step) * step;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const toPlan = (v) => ({ x: v.x / S, y: -v.z / S });

// ---------------------------------------------------------------- persistence & history
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(plan)); } catch { /* storage unavailable */ }
}

function pushHistory(snapshot = JSON.stringify(plan)) {
  history.push(snapshot);
  if (history.length > 200) history.shift();
}

function undo() {
  if (!history.length) return;
  plan = JSON.parse(history.pop());
  if (selection && !findSelected()) selection = null;
  rebuild(); save(); renderProps();
}

function normalise(p) {
  p.walls ||= []; p.openings ||= []; p.items ||= []; p.rooms ||= [];
  for (const it of p.items) { it.z ??= 0; it.rot ??= 0; }
  return p;
}

async function loadDefault() {
  const res = await fetch('plan.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Could not load plan.json');
  return normalise(await res.json());
}

// ---------------------------------------------------------------- scene building
function disposeChildren(obj) {
  obj.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
  obj.clear();
}

function register(kind, id, obj) {
  objects.set(`${kind}:${id}`, obj);
  obj.traverse((o) => { if (o.isMesh) { o.userData.pick = { kind, id }; pickables.push(o); } });
}

function rebuild() {
  disposeChildren(root);
  objects.clear();
  pickables.length = 0;
  const b = bounds();

  // floors: one per room outline if the plan has them, otherwise a rectangle under everything
  const outlined = plan.rooms.filter((r) => r.poly?.length >= 3);
  if (outlined.length) {
    for (const r of outlined) {
      const shape = new THREE.Shape(r.poly.map(([x, y]) => new THREE.Vector2(x * S, y * S)));
      const floor = new THREE.Mesh(new THREE.ShapeGeometry(shape), floorMaterial(r.floor));
      floor.rotation.x = -Math.PI / 2; // shape (x, y) -> world (x, 0, -y)
      floor.receiveShadow = true;
      root.add(floor);
    }
  } else {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(b.w * S, b.h * S), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(b.cx * S, 0, -b.cy * S);
    floor.receiveShadow = true;
    root.add(floor);
  }

  const size = 2 * Math.ceil(Math.max(b.w, b.h) / 2000) + 4; // even, so lines fall on whole metres
  const grid = new THREE.GridHelper(size, size, '#b9c0c9', '#cfd5dc');
  grid.position.set(Math.round(b.cx / 1000), 0.002, -Math.round(b.cy / 1000));
  root.add(grid);

  for (const w of plan.walls) buildWall(w);
  for (const it of plan.items) {
    const g = buildItem(it);
    placeItem(g, it);
    root.add(g);
    register('item', it.id, g);
  }
  for (const r of plan.rooms) root.add(roomLabel(r));

  // keep the sun's shadow box around the house
  const R = Math.max(b.w, b.h) * S;
  sun.position.set(b.cx * S - R * 0.6, R * 1.4, -b.cy * S + R * 0.9);
  sun.target.position.set(b.cx * S, 0, -b.cy * S);
  Object.assign(sun.shadow.camera, { left: -R, right: R, top: R, bottom: -R, far: R * 5 });
  sun.shadow.camera.updateProjectionMatrix();

  updateSelectionHelper();
  updateStatus();
}

function placeItem(g, it) {
  g.position.set(it.x * S, (it.z || 0) * S, -it.y * S);
  g.rotation.y = THREE.MathUtils.degToRad(it.rot || 0);
}

function boxMesh(w, h, d, material) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w * S, h * S, d * S), material);
  m.castShadow = m.receiveShadow = material !== pickMat && material !== glassMat;
  return m;
}

function buildWall(w) {
  const f = wallFrame(w);
  const t = w.thickness;
  const H = wallsCut ? Math.min(w.height, CUTAWAY_HEIGHT) : w.height;

  // wall group: local x runs along the wall from point a; local z = -(plan normal)
  const g = new THREE.Group();
  g.position.set(w.a[0] * S, 0, -w.a[1] * S);
  g.rotation.y = f.angle;
  root.add(g);

  const solid = new THREE.Group();
  g.add(solid);
  const seg = (s0, s1, h0, h1) => {
    if (s1 - s0 < 1 || h1 - h0 < 1) return;
    const m = boxMesh(s1 - s0, h1 - h0, t, wallMat);
    m.position.set(((s0 + s1) / 2) * S, ((h0 + h1) / 2) * S, 0);
    solid.add(m);
  };

  const ops = openingsOn(w.id)
    .map((o) => ({ o, s0: clamp(o.offset, 0, f.L), s1: clamp(o.offset + o.width, 0, f.L) }))
    .sort((p, q) => p.s0 - q.s0);

  // extend each wall by half its thickness so corners close up
  let cursor = -t / 2;
  for (const { o, s0, s1 } of ops) {
    seg(cursor, s0, 0, H);
    const sill = o.type === 'window' ? o.sill || 0 : 0;
    seg(Math.max(s0, cursor), s1, 0, Math.min(sill, H));
    seg(Math.max(s0, cursor), s1, Math.min(sill + o.height, H), H);
    cursor = Math.max(cursor, s1);
    buildOpening(g, w, o, H);
  }
  seg(cursor, f.L + t / 2, 0, H);
  register('wall', w.id, solid);
}

function buildOpening(wallGroup, w, o, H) {
  const t = w.thickness;
  const g = new THREE.Group();
  wallGroup.add(g);
  const sill = o.type === 'window' ? o.sill || 0 : 0;
  const top = Math.min(sill + o.height, H);

  // invisible box filling the opening, makes it easy to click
  if (top > sill) {
    const pick = boxMesh(o.width, top - sill, t + 20, pickMat);
    pick.position.set((o.offset + o.width / 2) * S, ((sill + top) / 2) * S, 0);
    g.add(pick);
  }

  if (o.type === 'window' && top > sill) {
    const glass = boxMesh(o.width - 20, top - sill - 20, 16, glassMat);
    glass.position.set((o.offset + o.width / 2) * S, ((sill + top) / 2) * S, 0);
    g.add(glass);
    const sillBoard = boxMesh(o.width + 60, 25, t + 40, doorMat);
    sillBoard.position.set((o.offset + o.width / 2) * S, Math.max(sill - 12, 12) * S, 0);
    if (sill > 0) g.add(sillBoard);
  }

  if (o.type === 'door') {
    const side = o.side === -1 ? -1 : 1;          // which side of the wall it swings into
    const dirx = o.hinge === 'end' ? -1 : 1;       // closed leaf direction from the hinge
    const hingeS = o.hinge === 'end' ? o.offset + o.width : o.offset;
    const alpha = THREE.MathUtils.degToRad(o.openAngle ?? 80);
    const pivot = new THREE.Group();
    pivot.position.set(hingeS * S, 0, -side * (t / 2) * S);
    pivot.rotation.y = Math.atan2(side * Math.sin(alpha), dirx * Math.cos(alpha));
    const leafH = Math.min(o.height, H) - 10;
    const leaf = boxMesh(o.width - 10, leafH, 40, doorMat);
    leaf.position.set(((o.width - 10) / 2) * S, (leafH / 2) * S, 0);
    pivot.add(leaf);
    g.add(pivot);

    // swing arc on the floor — shows the space the door needs
    const pts = [new THREE.Vector3(hingeS * S, 0.004, -side * (t / 2) * S)];
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * Math.PI / 2;
      pts.push(new THREE.Vector3(
        (hingeS + dirx * o.width * Math.cos(a)) * S, 0.004,
        -side * (t / 2 + o.width * Math.sin(a)) * S));
    }
    pts.push(pts[0].clone());
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), arcMat));
  }
  register('opening', o.id, g);
}

const labelTextures = new Map();
function roomLabel(r) {
  let tex = labelTextures.get(r.name);
  if (!tex) {
    const c = document.createElement('canvas');
    const font = '600 64px system-ui, sans-serif';
    let ctx = c.getContext('2d');
    ctx.font = font;
    c.width = Math.ceil(ctx.measureText(r.name).width) + 32; c.height = 96;
    ctx = c.getContext('2d'); // resizing resets the context state
    ctx.font = font;
    ctx.fillStyle = 'rgba(60,60,70,0.75)';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(r.name, c.width / 2, c.height / 2);
    tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    labelTextures.set(r.name, tex);
  }
  const aspect = tex.image.width / tex.image.height;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.3 * aspect, 0.3), // text ~300 mm tall
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  m.position.set(r.x * S, 0.02, -r.y * S); // just above rugs
  return m;
}

// ---------------------------------------------------------------- selection
function findSelected() {
  if (!selection) return null;
  if (selection.kind === 'item') return getItem(selection.id);
  if (selection.kind === 'wall') return getWall(selection.id);
  return getOpening(selection.id);
}

function select(sel) {
  selection = sel;
  updateSelectionHelper();
  renderProps();
  updateStatus();
}

function updateSelectionHelper() {
  if (selectionHelper) { scene.remove(selectionHelper); selectionHelper.dispose(); selectionHelper = null; }
  const obj = selection && objects.get(`${selection.kind}:${selection.id}`);
  if (!obj) return;
  root.updateMatrixWorld(true); // freshly built objects have no world transform yet
  selectionHelper = new THREE.BoxHelper(obj, 0xe8730c);
  scene.add(selectionHelper);
}

// ---------------------------------------------------------------- measurements
function itemHalfExtents(it) {
  const r = THREE.MathUtils.degToRad(it.rot || 0);
  const c = Math.abs(Math.cos(r)), s = Math.abs(Math.sin(r));
  return { hx: (it.w * c + it.d * s) / 2, hy: (it.w * s + it.d * c) / 2 };
}

// distance from point p along unit direction dir to a segment (or Infinity)
function raySegment(px, py, dx, dy, ax, ay, bx, by) {
  const ex = bx - ax, ey = by - ay;
  const den = dx * ey - dy * ex;
  if (Math.abs(den) < 1e-9) return Infinity;
  const t = ((ax - px) * ey - (ay - py) * ex) / den;
  const u = ((ax - px) * dy - (ay - py) * dx) / den;
  return t > 0 && u >= 0 && u <= 1 ? t : Infinity;
}

// gaps from the selected item's outline to the nearest wall or furniture in each plan direction
function clearances(it) {
  const { hx, hy } = itemHalfExtents(it);
  const z0 = it.z || 0, z1 = z0 + it.h;
  const dirs = [['←', -1, 0, hx], ['→', 1, 0, hx], ['↑', 0, 1, hy], ['↓', 0, -1, hy]];
  return dirs.map(([label, dx, dy, half]) => {
    let best = Infinity;
    for (const w of plan.walls) {
      const f = wallFrame(w);
      const ext = w.thickness / 2;
      const d = raySegment(it.x, it.y, dx, dy,
        w.a[0] - f.ux * ext, w.a[1] - f.uy * ext, w.b[0] + f.ux * ext, w.b[1] + f.uy * ext);
      if (d === Infinity) continue;
      const cos = Math.abs(dx * f.nx + dy * f.ny);
      best = Math.min(best, d - (cos > 1e-6 ? ext / cos : 0) - half);
    }
    for (const o of plan.items) {
      if (o === it || o.type === 'rug') continue;
      const oz0 = o.z || 0;
      if (oz0 >= z1 || oz0 + o.h <= z0) continue; // different height band
      const e = itemHalfExtents(o);
      // slab test against the other item's axis-aligned outline
      const perp = dx !== 0 ? Math.abs(o.y - it.y) < e.hy + hy : Math.abs(o.x - it.x) < e.hx + hx;
      if (!perp) continue;
      const gap = dx !== 0 ? dx * (o.x - it.x) - e.hx - hx : dy * (o.y - it.y) - e.hy - hy;
      if (gap >= -1) best = Math.min(best, gap);
    }
    return `${label} ${best === Infinity ? '—' : Math.round(Math.max(best, 0))}`;
  }).join('  ');
}

function updateStatus() {
  const o = findSelected();
  if (!o) {
    statusEl.textContent = `${plan.items.length} items · ${plan.walls.length} walls · ${plan.openings.length} doors/windows — gaps are shown in mm when you select furniture`;
    return;
  }
  if (selection.kind === 'item') {
    statusEl.textContent = `${o.name}: ${o.w}×${o.d}×${o.h} at (${Math.round(o.x)}, ${Math.round(o.y)}) · gaps (mm): ${clearances(o)}`;
  } else if (selection.kind === 'wall') {
    const f = wallFrame(o);
    statusEl.textContent = `${o.name || o.id}: length ${Math.round(f.L)} (centre line), ${o.thickness} thick, ${o.height} high`;
  } else {
    const w = getWall(o.wall), f = wallFrame(w);
    statusEl.textContent = `${o.type} ${o.width} wide on ${w.name || w.id}: ${Math.round(o.offset)} from start, ${Math.round(f.L - o.offset - o.width)} from end`;
  }
}

// ---------------------------------------------------------------- properties panel
const ITEM_FIELDS = [
  ['name', 'text', 'Name'], ['type', ITEM_TYPES, 'Type'],
  ['x', 'num', 'X'], ['y', 'num', 'Y'], ['w', 'num', 'Width'], ['d', 'num', 'Depth'],
  ['h', 'num', 'Height'], ['z', 'num', 'Off floor'], ['rot', 'num', 'Rotation °'], ['color', 'color', 'Colour'],
];
const OPENING_FIELDS = [
  ['type', ['door', 'window', 'opening'], 'Type'], ['wall', 'wall', 'Wall'],
  ['offset', 'num', 'From start'], ['width', 'num', 'Width'], ['height', 'num', 'Height'],
];
const WALL_FIELDS = [
  ['name', 'text', 'Name'], ['ax', 'num', 'Start X'], ['ay', 'num', 'Start Y'],
  ['bx', 'num', 'End X'], ['by', 'num', 'End Y'], ['thickness', 'num', 'Thickness'], ['height', 'num', 'Height'],
];

function fieldsFor(kind, o) {
  if (kind === 'item') {
    const f = [...ITEM_FIELDS];
    if (['base-unit', 'sink-unit', 'hob-unit'].includes(o.type)) f.push(['worktop', 'color', 'Worktop']);
    if (o.type === 'sectional') {
      f.push(['chaise', ['left', 'right'], 'Chaise side']);
      f.push(['chaiseW', 'num', 'Chaise width']);
      f.push(['seatD', 'num', 'Main depth']);
    }
    return f;
  }
  if (kind === 'wall') return WALL_FIELDS;
  const f = [...OPENING_FIELDS];
  if (o.type === 'window') f.push(['sill', 'num', 'Sill height']);
  if (o.type === 'door') {
    f.push(['hinge', ['start', 'end'], 'Hinge']);
    f.push(['side', [['1', 'Left side'], ['-1', 'Right side']], 'Opens to']);
    f.push(['openAngle', 'num', 'Open angle °']);
  }
  return f;
}

function getField(kind, o, key) {
  if (kind === 'wall' && key.length === 2 && 'ab'.includes(key[0]) && 'xy'.includes(key[1])) {
    return o[key[0]][key[1] === 'x' ? 0 : 1];
  }
  return o[key];
}

function setField(kind, o, key, value) {
  if (kind === 'wall' && key.length === 2 && 'ab'.includes(key[0]) && 'xy'.includes(key[1])) {
    o[key[0]][key[1] === 'x' ? 0 : 1] = value;
  } else {
    o[key] = value;
  }
  if (kind === 'opening' && key === 'type' && value === 'window') { o.sill ??= 900; }
  if (kind === 'opening' && key === 'side') o.side = Number(value);
}

function renderProps() {
  const el = $('#props');
  const o = findSelected();
  if (!o) { el.innerHTML = '<p class="hint">Click a wall, door, window or piece of furniture to select it.</p>'; return; }
  const kind = selection.kind;
  el.innerHTML = '';
  const head = document.createElement('div');
  head.className = 'kind';
  head.textContent = kind === 'opening' ? 'Door / window' : kind === 'wall' ? 'Wall' : 'Item';
  el.appendChild(head);

  for (const [key, type, label] of fieldsFor(kind, o)) {
    const row = document.createElement('div');
    row.className = 'row';
    const lab = document.createElement('label');
    lab.textContent = label;
    let input;
    if (Array.isArray(type) || type === 'wall') {
      input = document.createElement('select');
      const opts = type === 'wall' ? plan.walls.map((w) => [w.id, w.name || w.id]) : type;
      for (const opt of opts) {
        const [val, text] = Array.isArray(opt) ? opt : [opt, opt];
        const op = document.createElement('option');
        op.value = val; op.textContent = text;
        input.appendChild(op);
      }
      input.value = String(getField(kind, o, key) ?? (key === 'side' ? 1 : ''));
    } else {
      input = document.createElement('input');
      input.type = type === 'num' ? 'number' : type;
      if (type === 'num') input.step = key === 'rot' || key === 'openAngle' ? '5' : '10';
      const v = getField(kind, o, key);
      input.value = v ?? (type === 'color' ? '#bbbbbb' : '');
    }
    input.addEventListener('change', () => {
      pushHistory();
      const v = type === 'num' ? Number(input.value) || 0 : input.value;
      setField(kind, o, key, v);
      rebuild(); save(); renderProps();
    });
    row.append(lab, input);
    el.appendChild(row);
  }

  const actions = document.createElement('div');
  actions.className = 'actions';
  const btn = (text, fn, cls) => {
    const b = document.createElement('button');
    b.textContent = text; if (cls) b.className = cls;
    b.addEventListener('click', fn);
    actions.appendChild(b);
  };
  if (kind === 'item') { btn('Rotate 90°', () => rotateSelected(90)); btn('Duplicate', duplicateSelected); }
  if (kind === 'wall') { btn('+ Door here', () => addOpening('door')); btn('+ Window here', () => addOpening('window')); }
  if (kind === 'opening' && o.type === 'door') btn('Flip swing', () => { pushHistory(); o.side = -(o.side || 1); rebuild(); save(); renderProps(); });
  btn('Delete', deleteSelected, 'danger');
  el.appendChild(actions);
}

// ---------------------------------------------------------------- editing actions
function viewCentre() {
  const p = toPlan(controls.target);
  return { x: snap(p.x, SNAP), y: snap(p.y, SNAP) };
}

function addItem(preset) {
  pushHistory();
  const c = viewCentre();
  const it = { id: newId('i', plan.items), z: 0, rot: 0, ...structuredClone(preset), x: c.x, y: c.y };
  plan.items.push(it);
  rebuild(); save();
  select({ kind: 'item', id: it.id });
}

function addWall() {
  pushHistory();
  const c = viewCentre();
  const w = { id: newId('W', plan.walls), name: 'New wall', a: [c.x - 1000, c.y], b: [c.x + 1000, c.y], thickness: 100, height: plan.walls[0]?.height || 2400 };
  plan.walls.push(w);
  rebuild(); save();
  select({ kind: 'wall', id: w.id });
}

function addOpening(type) {
  let wall = null;
  if (selection?.kind === 'wall') wall = getWall(selection.id);
  if (selection?.kind === 'opening') wall = getWall(getOpening(selection.id).wall);
  if (!wall) { alert('Select a wall first, then add the door or window.'); return; }
  pushHistory();
  const f = wallFrame(wall);
  const width = type === 'door' ? 826 : 1200;
  const o = type === 'door'
    ? { id: newId('O', plan.openings), type, wall: wall.id, offset: snap((f.L - width) / 2, SNAP), width, height: 2040, hinge: 'start', side: 1, openAngle: 80 }
    : { id: newId('O', plan.openings), type, wall: wall.id, offset: snap((f.L - width) / 2, SNAP), width, height: 1200, sill: 900 };
  plan.openings.push(o);
  rebuild(); save();
  select({ kind: 'opening', id: o.id });
}

function rotateSelected(deg) {
  if (selection?.kind !== 'item') return;
  pushHistory();
  const it = getItem(selection.id);
  it.rot = (((it.rot || 0) + deg) % 360 + 360) % 360;
  rebuild(); save(); renderProps();
}

function duplicateSelected() {
  if (selection?.kind !== 'item') return;
  pushHistory();
  const src = getItem(selection.id);
  const it = { ...structuredClone(src), id: newId('i', plan.items), x: src.x + 200, y: src.y - 200 };
  plan.items.push(it);
  rebuild(); save();
  select({ kind: 'item', id: it.id });
}

function deleteSelected() {
  if (!findSelected()) return;
  pushHistory();
  const { kind, id } = selection;
  if (kind === 'item') plan.items = plan.items.filter((i) => i.id !== id);
  if (kind === 'opening') plan.openings = plan.openings.filter((o) => o.id !== id);
  if (kind === 'wall') {
    plan.walls = plan.walls.filter((w) => w.id !== id);
    plan.openings = plan.openings.filter((o) => o.wall !== id);
  }
  selection = null;
  rebuild(); save(); renderProps();
}

// ---------------------------------------------------------------- pointer interaction
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
let drag = null;
let down = null;

function setRay(e) {
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
}

function planPoint(e, height = 0) {
  setRay(e);
  dragPlane.constant = -height * S;
  const p = new THREE.Vector3();
  return raycaster.ray.intersectPlane(dragPlane, p) ? toPlan(p) : null;
}

function pickAt(e) {
  setRay(e);
  const hit = raycaster.intersectObjects(pickables, false)[0];
  return hit ? hit.object.userData.pick : null;
}

// endpoints of other walls that sit on wall w (corners and T-junctions)
function linkedEndpoints(w) {
  const f = wallFrame(w);
  const links = [];
  for (const o of plan.walls) {
    if (o === w) continue;
    for (const end of ['a', 'b']) {
      const p = o[end];
      const rx = p[0] - w.a[0], ry = p[1] - w.a[1];
      const along = rx * f.ux + ry * f.uy, across = rx * f.nx + ry * f.ny;
      if (Math.abs(across) < 2 && along > -2 && along < f.L + 2) {
        links.push({ wall: o, end, orig: [...p], ops: end === 'a' ? openingsOn(o.id).map((op) => [op, op.offset]) : [] });
      }
    }
  }
  return links;
}

renderer.domElement.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;
  down = { x: e.clientX, y: e.clientY };
  const pick = pickAt(e);
  if (!pick) return;
  const wasSelected = selection && selection.kind === pick.kind && selection.id === pick.id;
  select(pick);
  if (pick.kind === 'wall' && !wasSelected) return; // first click selects, second drags
  const target = findSelected();
  const height = pick.kind === 'item' ? target.z || 0 : 0;
  const start = planPoint(e, height);
  if (!start) return;
  drag = { pick, start, height, snapshot: JSON.stringify(plan), moved: false, orig: structuredClone(target) };
  if (pick.kind === 'wall') drag.links = linkedEndpoints(target);
  controls.enabled = false;
  renderer.domElement.setPointerCapture(e.pointerId);
}, { capture: true });

renderer.domElement.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const p = planPoint(e, drag.height);
  if (!p) return;
  const dx = p.x - drag.start.x, dy = p.y - drag.start.y;
  if (!drag.moved && Math.hypot(dx, dy) < 15) return;
  if (!drag.moved) { pushHistory(drag.snapshot); drag.moved = true; }
  const step = e.shiftKey ? 10 : SNAP;
  const target = findSelected();

  if (drag.pick.kind === 'item') {
    target.x = snap(drag.orig.x + dx, step);
    target.y = snap(drag.orig.y + dy, step);
    placeItem(objects.get(`item:${target.id}`), target);
    updateStatus();
    return;
  }
  if (drag.pick.kind === 'opening') {
    const f = wallFrame(getWall(target.wall));
    target.offset = clamp(snap(drag.orig.offset + dx * f.ux + dy * f.uy, step), 0, Math.max(0, f.L - target.width));
  } else {
    const f = wallFrame(drag.orig);
    const dn = snap(dx * f.nx + dy * f.ny, step);
    const mx = f.nx * dn, my = f.ny * dn;
    target.a = [drag.orig.a[0] + mx, drag.orig.a[1] + my];
    target.b = [drag.orig.b[0] + mx, drag.orig.b[1] + my];
    for (const l of drag.links) {
      l.wall[l.end] = [l.orig[0] + mx, l.orig[1] + my];
      if (l.end === 'a') {
        // keep doors on the stretched wall where they are in the room
        const lf = wallFrame(l.wall);
        const shift = mx * lf.ux + my * lf.uy;
        for (const [op, off] of l.ops) op.offset = Math.max(0, off - shift);
      }
    }
  }
  rebuild();
});

renderer.domElement.addEventListener('pointerup', (e) => {
  if (drag) {
    controls.enabled = true;
    const moved = drag.moved;
    drag = null;
    if (moved) { rebuild(); save(); renderProps(); }
    return;
  }
  if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 4 && !pickAt(e)) select(null);
  down = null;
});

// ---------------------------------------------------------------- view & toolbar
function fitOrtho() {
  const b = bounds();
  const aspect = view.clientWidth / Math.max(view.clientHeight, 1);
  const half = Math.max(b.h / 2, b.w / 2 / aspect) * 1.15 * S;
  Object.assign(ortho, { left: -half * aspect, right: half * aspect, top: half, bottom: -half });
  ortho.updateProjectionMatrix();
}

function resetCameras() {
  const b = bounds();
  const c = new THREE.Vector3(b.cx * S, 0, -b.cy * S);
  const R = Math.max(b.w, b.h) * S;
  persp.position.set(c.x - R * 0.2, R * 1.1, c.z + R * 1.1);
  ortho.position.set(c.x, 50, c.z);
  ortho.zoom = 1;
  fitOrtho();
  controls.target.copy(c);
  controls.update();
}

function toggleView() {
  const target = controls.target.clone();
  controls.dispose();
  camera = camera === persp ? ortho : persp;
  if (camera === ortho) ortho.position.set(target.x, 50, target.z);
  controls = makeControls(camera);
  controls.target.copy(target);
  controls.update();
  sun.castShadow = camera === persp; // shadows only get in the way on the flat plan
  $('#btn-view').textContent = camera === persp ? 'Plan view' : '3D view';
}

function toggleWalls() {
  wallsCut = !wallsCut;
  $('#btn-walls').textContent = wallsCut ? 'Walls: cut-away' : 'Walls: full';
  rebuild();
}

function resize() {
  const w = view.clientWidth, h = Math.max(view.clientHeight, 1);
  renderer.setSize(w, h);
  persp.aspect = w / h;
  persp.updateProjectionMatrix();
  if (plan) fitOrtho();
}
new ResizeObserver(resize).observe(view);

function buildCatalog() {
  const el = $('#catalog');
  const groups = new Map();
  for (const entry of CATALOG) {
    if (!groups.has(entry.group)) groups.set(entry.group, []);
    groups.get(entry.group).push(entry);
  }
  for (const [name, entries] of groups) {
    const det = document.createElement('details');
    det.open = name === 'Kitchen';
    det.innerHTML = `<summary>${name}</summary>`;
    const box = document.createElement('div');
    box.className = 'items';
    for (const entry of entries) {
      const b = document.createElement('button');
      b.textContent = entry.label;
      b.addEventListener('click', () => addItem(entry.item));
      box.appendChild(b);
    }
    det.appendChild(box);
    el.appendChild(det);
  }
}

$('#btn-view').addEventListener('click', toggleView);
$('#btn-walls').addEventListener('click', toggleWalls);
$('#btn-undo').addEventListener('click', undo);
$('#btn-add-wall').addEventListener('click', addWall);
$('#btn-add-door').addEventListener('click', () => addOpening('door'));
$('#btn-add-window').addEventListener('click', () => addOpening('window'));
$('#btn-export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'plan.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('#file-import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const next = normalise(JSON.parse(await file.text()));
    pushHistory();
    plan = next; selection = null;
    rebuild(); save(); renderProps(); resetCameras();
  } catch (err) {
    alert('That file is not a valid plan: ' + err.message);
  }
  e.target.value = '';
});
$('#btn-reset').addEventListener('click', async () => {
  if (!confirm('Discard the changes saved in this browser and reload plan.json?')) return;
  pushHistory();
  plan = await loadDefault(); selection = null;
  rebuild(); save(); renderProps(); resetCameras();
});

window.addEventListener('keydown', (e) => {
  if (e.target.closest('input, select, textarea')) return;
  const k = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); undo(); return; }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (k === 'r') rotateSelected(e.shiftKey ? 15 : 90);
  else if (k === 'd') duplicateSelected();
  else if (k === 'delete' || k === 'backspace') { e.preventDefault(); deleteSelected(); }
  else if (k === 'escape') select(null);
  else if (k === 'v') toggleView();
  else if (k === 'c') toggleWalls();
});

// ---------------------------------------------------------------- start
(async function init() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    plan = stored ? normalise(JSON.parse(stored)) : null;
  } catch { plan = null; }
  try {
    plan ||= await loadDefault();
  } catch (err) {
    statusEl.textContent = 'Could not load plan.json — serve this folder over http (see README). ' + err.message;
    return;
  }
  buildCatalog();
  resize();
  rebuild();
  resetCameras();
  renderer.setAnimationLoop(() => {
    controls.update();
    selectionHelper?.update();
    renderer.render(scene, camera);
  });
})();
