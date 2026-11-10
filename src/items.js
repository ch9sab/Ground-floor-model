// Builds 3D meshes for furniture and kitchen items.
// Local frame (mm): x = width centred on 0, y = up from the item's base,
// z = depth centred on 0 with +z being the item's FRONT.
import * as THREE from 'three';

const S = 0.001; // mm -> metres
const materials = new Map();

function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!materials.has(key)) {
    materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...opts }));
  }
  return materials.get(key);
}

function shade(color, f) {
  const c = new THREE.Color(color).multiplyScalar(f);
  return '#' + c.getHexString();
}

function box(g, w, h, d, x, y, z, color, opts) {
  if (w <= 0 || h <= 0 || d <= 0) return null;
  const m = new THREE.Mesh(new THREE.BoxGeometry(w * S, h * S, d * S), mat(color, opts));
  m.position.set(x * S, y * S, z * S);
  m.castShadow = true;
  m.receiveShadow = true;
  g.add(m);
  return m;
}

const CARCASS = '#efede8';

// a straight member between two points in the y-z plane (mm), tx thick across, tz thick the other way
function strut(g, x, [y0, z0], [y1, z1], tx, tz, color) {
  const len = Math.hypot(y1 - y0, z1 - z0);
  const m = box(g, tx, len, tz, x, (y0 + y1) / 2, (z0 + z1) / 2, color);
  m.rotation.x = Math.atan2(z1 - z0, y1 - y0);
  return m;
}

// Longview-style dining chair, modelled at its drawn size (508 x 673 x 749 mm)
// and then stretched to the item's w/d/h. +z is the front.
function longviewChair(it) {
  const outer = new THREE.Group();
  const g = new THREE.Group();
  outer.add(g);
  g.scale.set(it.w / 508, it.h / 749, it.d / 673);
  const c = it.color || '#dcc29a';
  const slat = shade(c, 0.93);
  for (const side of [-1, 1]) {
    const x = side * (508 / 2 - 13);
    strut(g, x, [0, 323], [462, 278], 25, 45, c);      // front leg, splayed forward
    strut(g, x, [0, -321], [440, -112], 25, 55, c);    // back leg, splayed back
    strut(g, x, [425, -112], [749, -170], 25, 45, c);  // back post
    strut(g, x, [432, 290], [412, -125], 25, 65, c);   // seat rail
  }
  // slatted seat, 419 deep, front edge at 470 high with a slight 4° rake back
  const slats = 6, seatD = 419, z0 = 285;
  for (let i = 0; i < slats; i++) {
    const z = z0 - (seatD / slats) * (i + 0.5);
    const y = 470 - 9 - (z0 - z) * Math.tan((4 * Math.PI) / 180);
    box(g, 508 - 50, 18, seatD / slats - 8, 0, y, z, slat);
  }
  // back panel (127 tall) leaning with the back posts
  const back = box(g, 508 - 50, 127, 20, 0, 668, -140, c);
  back.rotation.x = -Math.atan2(58, 324);
  return outer;
}

function legs(g, w, d, h, size, inset, color) {
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(g, size, h, size, sx * (w / 2 - inset), h / 2, sz * (d / 2 - inset), color);
  }
}

function baseUnit(g, it) {
  const { w, d, h } = it;
  const plinth = 100, top = 40, door = 20;
  box(g, w - 10, plinth, d - 70, 0, plinth / 2, -35, '#3a3a3a');
  box(g, w, h - plinth - top, d - door, 0, plinth + (h - plinth - top) / 2, -door / 2, CARCASS);
  box(g, w - 4, h - plinth - top - 4, door - 2, 0, plinth + (h - plinth - top) / 2, d / 2 - door / 2, it.color);
  box(g, w, top, d + 20, 0, h - top / 2, 10, it.worktop || '#d8d2c4');
}

// Plywood cabinet built from panels, so open cells really are open.
// it.fronts lists rows from top to bottom, separated by '/'. Each row is
// [height:]<count><kind>, e.g. "150:1w/1w/1w" = shallow drawer over two drawers.
// Kinds: d door, w drawer, o open, b wire basket, x empty space (e.g. for a fridge),
// v oven, m compact oven. Rows without a height share the remaining space.
const PLY = '#dcc39b';
function cabinet(g, it) {
  const T = 18;
  const { w, d, h } = it;
  const ply = it.carcass || PLY, front = it.color || '#b5654c';
  const plinth = it.plinth ?? 0, top = it.topT ?? 0;
  const cH = h - plinth - top, y0 = plinth;
  const handle = (x, y) => box(g, 100, 16, 4, x, y, d / 2 + 1, '#4a3a2e');
  if (plinth > 0) box(g, w - 4, plinth, d - 60, 0, plinth / 2, -30, shade(ply, 0.82));
  // carcass panels: sides, base, top, back
  for (const sx of [-1, 1]) box(g, T, cH, d, sx * (w / 2 - T / 2), y0 + cH / 2, 0, ply);
  box(g, w - 2 * T, T, d, 0, y0 + T / 2, 0, ply);
  box(g, w - 2 * T, T, d, 0, y0 + cH - T / 2, 0, ply);
  box(g, w - 2 * T, cH - 2 * T, T, 0, y0 + cH / 2, -d / 2 + T / 2, shade(ply, 0.92));
  // rows
  const rows = String(it.fronts || '1d').split('/').map((r) => {
    const m = r.trim().match(/^(?:(\d+):)?(\d*)([dwobxvm])$/);
    return m ? { h: m[1] ? Number(m[1]) : null, n: Number(m[2] || 1), k: m[3] } : { h: null, n: 1, k: 'd' };
  });
  const inner = cH - 2 * T - (rows.length - 1) * T;
  const fixed = rows.reduce((a, r) => a + (r.h || 0), 0);
  const free = rows.filter((r) => !r.h).length;
  const share = free ? Math.max(50, (inner - fixed) / free) : 0;
  let yTop = y0 + cH - T;
  const iw = w - 2 * T;
  rows.forEach((r, ri) => {
    const rh = r.h || share;
    const yc = yTop - rh / 2;
    const open = 'obx'.includes(r.k);
    const cw = (iw - (open ? (r.n - 1) * T : 0)) / r.n;
    for (let i = 0; i < r.n; i++) {
      const xc = -iw / 2 + cw / 2 + i * (cw + (open ? T : 0));
      if (open && i > 0) box(g, T, rh, d - T, xc - cw / 2 - T / 2, yc, T / 2, ply); // divider
      if (r.k === 'd' || r.k === 'w') {
        box(g, cw - 4, rh - 4, T, xc, yc, d / 2 - T / 2, front);
        const hy = r.k === 'w' ? yc + Math.min(rh / 2 - 40, 60) : (it.handle === 'bottom' ? yc - rh / 2 + 70 : yc + rh / 2 - 70);
        handle(xc, hy);
      } else if (r.k === 'b') {
        box(g, cw - 40, rh - 50, d - 80, xc, yc - 10, 20, '#4b4f55');
      } else if (r.k === 'v' || r.k === 'm') {
        box(g, cw - 4, rh - 4, 25, xc, yc, d / 2 - 12, '#161616', { roughness: 0.3 });
        const winH = r.k === 'v' ? rh * 0.5 : rh * 0.42;
        box(g, cw * 0.72, winH, 4, xc, yc - rh * 0.08, d / 2 + 2, '#2c2f33', { roughness: 0.15 });
        box(g, cw * 0.12, 22, 4, xc, yc + rh / 2 - 40, d / 2 + 2, '#d8d2c0');
      }
    }
    if (ri < rows.length - 1) box(g, iw, T, open ? d - T : d, 0, yTop - rh - T / 2, open ? T / 2 : 0, ply); // rail/shelf
    yTop -= rh + T;
  });
  // worktop, sink and hob
  if (top > 0) {
    const wt = it.worktop || '#e6e2da';
    box(g, w, top, d + 20, 0, h - top / 2, 10, wt);
    if (it.sink) {
      const bowls = it.sink === 'double' ? 2 : 1, bw = (w - 160) / bowls;
      for (let i = 0; i < bowls; i++) {
        const bx = -((w - 160) / 2) + bw * (i + 0.5);
        box(g, bw - 30, 4, d - 160, bx, h + 1, 10, '#b9bec4', { metalness: 0.3, roughness: 0.3 });
        box(g, bw - 70, 5, d - 200, bx, h + 2, 10, '#7d8389', { roughness: 0.4 });
      }
      box(g, 30, 300, 30, 0, h + 150, -d / 2 + 60, '#c9ced3', { metalness: 0.4, roughness: 0.25 });
      box(g, 30, 30, 200, 0, h + 300, -d / 2 + 150, '#c9ced3', { metalness: 0.4, roughness: 0.25 });
    }
    if (it.hob) box(g, Math.min(800, w - 100), 6, 520, 0, h + 3, 10, '#111111', { roughness: 0.15 });
  }
}

// cylinder of radius r and length len along 'x', 'y' or 'z'
function cyl(g, r, len, x, y, z, axis, color, opts) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r * S, r * S, len * S, 20), mat(color, opts));
  if (axis === 'x') m.rotation.z = Math.PI / 2;
  if (axis === 'z') m.rotation.x = Math.PI / 2;
  m.position.set(x * S, y * S, z * S);
  m.castShadow = m.receiveShadow = true;
  g.add(m);
  return m;
}

const STEEL = '#1d1d1f', PAD = '#202022', CHROME = '#c8ccd0';

// Seated leg extension / curl machine (user faces +z, rollers at the front).
function legMachine(g, it) {
  const { w, d, h } = it, red = it.color || '#c4262e', t = 60;
  const z0 = -d / 2 + 120, z1 = d / 2 - 260;          // base frame (front leaves room for the lower roller)
  for (const sx of [-1, 1]) box(g, t, t, z1 - z0, sx * (w / 2 - 260), t / 2, (z0 + z1) / 2, STEEL);
  box(g, w - 520, t, t, 0, t / 2, z0, STEEL);
  box(g, w * 0.55, t, t, 0, t / 2, z1, STEEL);
  for (const sx of [-1, 1]) for (const z of [z0, z1]) box(g, 80, 30, 80, sx * (w / 2 - 260), 15, z, '#111');
  box(g, t, 420, t, 0, 210, z0 + 200, STEEL);         // rear seat post
  box(g, t, 400, t, 0, 200, z1 - 200, STEEL);         // front seat post
  box(g, t, t, z1 - z0 - 200, 0, 400, (z0 + z1) / 2, STEEL);
  // seat and backrest
  const seatZ = (z0 + z1) / 2 + 60;
  box(g, 330, 70, 520, 0, 470, seatZ, PAD);
  const back = box(g, 320, 640, 70, 0, 520 + 300, z0 + 140, PAD);
  back.rotation.x = -0.28;
  // side uprights with the cam disc, lever arm and rollers
  const sideX = 260;
  box(g, t, 700, t, sideX, 350, seatZ + 260, STEEL);
  cyl(g, 140, 30, sideX + 40, 640, seatZ + 260, 'x', STEEL);
  const arm = box(g, 70, 520, 70, sideX - 40, 420, seatZ + 400, red);
  arm.rotation.x = 0.45;
  cyl(g, 65, 410, 0, 560, seatZ + 330, 'x', PAD);     // upper (thigh) roller
  cyl(g, 75, 480, 0, 200, z1 + 140, 'x', PAD);        // lower (shin) roller
  // plate-loading arm out the side with a chrome horn
  box(g, 360, 60, 60, -sideX - 120, 420, seatZ + 150, red);
  cyl(g, 25, 300, -w / 2 + 150, 440, seatZ + 150, 'x', CHROME, { metalness: 0.6, roughness: 0.25 });
  void h;
}

// Under-desk walking pad / folding treadmill (user faces +z, motor housing at the front).
function walkingPad(g, it) {
  const { w, d, h } = it, deckH = 60, house = 220;
  box(g, w, 110, house, 0, 55, d / 2 - house / 2, it.color || '#2a2b2e');           // motor housing
  box(g, w - 40, deckH, d - house, 0, deckH / 2, -house / 2, '#2a2b2e');            // deck
  box(g, w - 170, 4, d - house - 60, 0, deckH + 2, -house / 2, '#111111');          // belt
  for (const sx of [-1, 1]) box(g, 60, deckH + 6, d - house, sx * (w / 2 - 50), (deckH + 6) / 2, -house / 2, '#9a9da2', { roughness: 0.4 }); // silver side rails
  if (it.handlebar !== 'down') {
    const postZ = d / 2 - house - 20;
    for (const sx of [-1, 1]) {
      box(g, 45, h - deckH, 45, sx * (w / 2 - 40), deckH + (h - deckH) / 2, postZ, '#3a3b3e');
      box(g, 55, 55, 450, sx * (w / 2 - 40), h - 28, postZ - 225, '#3a3b3e');      // handles over the deck
    }
    box(g, w - 40, 50, 50, 0, h - 25, postZ, '#3a3b3e');
  }
  for (const sx of [-1, 1]) cyl(g, 22, 30, sx * (w / 2 - 60), 22, d / 2 - 40, 'x', '#d4a24a');
}

// Nordic / hyperextension bench (pads at the top, foot plate and ankle rollers at the back).
function hyperBench(g, it) {
  const { w, d, h } = it, t = 55;
  box(g, t, t, d - 300, 0, t / 2, -150 / 2, STEEL);                 // spine
  box(g, w, t, t, 0, t / 2, -d / 2 + 120, STEEL);                   // rear foot bar
  for (const sx of [-1, 1]) {
    box(g, t, t, 420, sx * (w / 2 - 30), t / 2, d / 2 - 210, STEEL); // front U-hoop legs
    box(g, 70, 40, 70, sx * (w / 2 - 30), 20, d / 2 - 20, '#111');
    box(g, 70, 40, 70, sx * (w / 2 - 30), 20, -d / 2 + 120, '#111');
  }
  box(g, w, t, t, 0, t / 2, d / 2 - 420, STEEL);
  // angled struts up to the pad carriage
  const s1 = strut(g, 0, [t, -d / 2 + 300], [h - 160, -60], t, t, STEEL); void s1;
  strut(g, 0, [t, d / 2 - 420], [h - 160, 120], t, t, STEEL);
  box(g, 120, 60, 700, 0, h - 150, 0, STEEL);                        // carriage
  // two rounded hip pads side by side
  for (const sx of [-1, 1]) {
    box(g, 230, 90, 520, sx * 125, h - 75, 60, PAD);
    cyl(g, 120, 230, sx * 125, h - 60, 60, 'x', PAD).scale.set(1, 0.6, 1);
  }
  // handles at the front
  for (const sx of [-1, 1]) strut(g, sx * 230, [h - 160, 320], [h - 300, 520], 30, 30, STEEL);
  // foot plate and ankle rollers at the back
  strut(g, 0, [h - 160, -300], [450, -d / 2 + 260], t, t, STEEL);
  box(g, 380, 420, 20, 0, 560, -d / 2 + 200, '#2c2c2e');
  for (const y of [520, 700]) for (const sx of [-1, 1]) cyl(g, 60, 170, sx * 100, y, -d / 2 + 290, 'x', PAD);
}

// Wall-mounted cable rack with weight stacks and plate-storage wings.
// The back (-z) is the wall. Frame depth `frameD`; the pull-up extension reaches the full item depth.
function cableRack(g, it) {
  const { w, d, h } = it, frameD = Math.min(it.frameD ?? 737, d), t = 75, blk = it.color || '#1b1b1d';
  const zb = -d / 2, zf = zb + frameD, top = Math.min(2032, h);
  const cw = it.coreW ?? 1404, cx = cw / 2 - t / 2;
  const metal = { roughness: 0.5 };
  box(g, cw, Math.min(1900, top - 100), 20, 0, top - Math.min(1900, top - 100) / 2, zb + 10, blk, metal); // wall plate
  for (const sx of [-1, 1]) {
    for (const z of [zb + 60, zf - t / 2]) box(g, t, top, t, sx * cx, top / 2, z, blk, metal);       // uprights
    box(g, t, t, frameD, sx * cx, t / 2, zb + frameD / 2, blk, metal);                              // foot rails
    box(g, t, t, frameD, sx * cx, top - t / 2, zb + frameD / 2, blk, metal);                        // top rails
    // cable trolley with pulley on each front upright
    box(g, 120, 200, 120, sx * (cx + 90), 1150, zf - 20, '#2b2b2e', metal);
    cyl(g, 55, 30, sx * (cx + 90), 1080, zf + 50, 'x', '#3a3a3d');
  }
  box(g, cw, 250, t, 0, top - 125, zf - t / 2, blk, metal);       // front header
  box(g, cw, t, t, 0, t / 2, zf - t / 2, blk, metal);             // front base
  // two weight stacks with chrome guide rods
  for (const sx of [-1, 1]) {
    box(g, 330, 650, 160, sx * 210, 420, zb + frameD * 0.45, '#111113', metal);
    for (const rx of [-110, 110]) cyl(g, 10, top - 400, sx * 210 + rx, (top - 300) / 2 + 100, zb + frameD * 0.45 + 95, 'y', CHROME, { metalness: 0.6, roughness: 0.25 });
  }
  // lat bar
  box(g, cw - 300, 28, 28, 0, top - 330, zf + 40, CHROME, { metalness: 0.6, roughness: 0.25 });
  // pull-up bar on extension brackets
  if (d > frameD + 50) {
    for (const sx of [-1, 1]) box(g, 60, 60, d - frameD, sx * (cx - 60), top - 30, zf + (d - frameD) / 2, blk, metal);
    cyl(g, 16, cw - 80, 0, top - 70, d / 2 - 40, 'x', CHROME, { metalness: 0.6, roughness: 0.25 });
  }
  // storage wings either side, shallow off the wall, with plate horns pointing outwards
  const wingX = w / 2 - t / 2 - 150, wingD = it.wingD ?? 215;
  if (wingX > cx + 200) {
    for (const sx of [-1, 1]) {
      box(g, t, top - 120, t, sx * wingX, (top - 120) / 2, zb + wingD, blk, metal);
      box(g, wingX - cx, t, t, sx * (cx + wingX) / 2, top - 160, zb + wingD, blk, metal);
      box(g, t, t, wingD + 120, sx * wingX, t / 2, zb + wingD / 2 + 20, blk, metal);
      box(g, wingX - cx, t, t, sx * (cx + wingX) / 2, t / 2, zb + 60, blk, metal);
      for (const y of [350, 750, 1150, 1550]) cyl(g, 25, 180, sx * (wingX + 120), y, zb + wingD, 'x', '#2b2b2e');
    }
  }
}

export function buildItem(it) {
  const g = new THREE.Group();
  const { w, d, h } = it;
  const c = it.color || '#bbbbbb';

  switch (it.type) {
    case 'sofa': {
      const arm = Math.min(180, w * 0.15);
      const seatH = h * 0.5;
      const backD = Math.min(220, d * 0.25);
      box(g, w - 2 * arm, seatH, d - backD, 0, seatH / 2, backD / 2, c);
      box(g, w - 2 * arm - 20, 120, d - backD - 40, 0, seatH + 60, backD / 2 + 10, shade(c, 1.15));
      box(g, w, h, backD, 0, h / 2, -d / 2 + backD / 2, c);
      box(g, arm, h * 0.7, d - backD, -w / 2 + arm / 2, h * 0.35, backD / 2, c);
      box(g, arm, h * 0.7, d - backD, w / 2 - arm / 2, h * 0.35, backD / 2, c);
      break;
    }
    case 'table': {
      box(g, w, 30, d, 0, h - 15, 0, c);
      legs(g, w, d, h - 30, 50, 70, shade(c, 0.8));
      break;
    }
    case 'trestle-table': {
      // Extendable table: legs and frame stay put, the top grows from closedW to w.
      const top = 30, apron = 70, leg = 60;
      const span = it.legSpan ?? 1270;           // outside of leg to outside of leg, lengthways
      const legZ = d / 2 - (it.legInset ?? 80);  // legs are set in from the long edges
      const under = h - top - apron;             // 650 clearance under the apron
      const lx = span / 2 - leg / 2, frame = shade(c, 0.95);
      const closed = Math.min(it.closedW ?? w, w);
      box(g, closed, top, d, 0, h - top / 2, 0, c);
      if (w > closed) {                          // extension leaves at each end
        const leaf = (w - closed) / 2;
        for (const sx of [-1, 1]) box(g, leaf - 4, top, d, sx * (closed / 2 + leaf / 2 + 2), h - top / 2, 0, shade(c, 1.05));
      }
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, leg, h - top, leg, sx * lx, (h - top) / 2, sz * legZ, frame);
      for (const sz of [-1, 1]) box(g, 2 * lx, apron, 25, 0, under + apron / 2, sz * legZ, frame);   // side aprons
      for (const sx of [-1, 1]) box(g, 25, apron, 2 * legZ, sx * lx, under + apron / 2, 0, frame);   // end aprons
      const low = it.stretcher ?? 150, sh = 60;
      for (const sx of [-1, 1]) box(g, 40, sh, 2 * legZ, sx * lx, low + sh / 2, 0, frame);           // end stretchers
      box(g, 2 * lx, sh, 40, 0, low + sh / 2, 0, frame);                                          // centre stretcher
      break;
    }
    case 'longview-chair':
      g.add(longviewChair(it));
      break;
    case 'chair': {
      const seat = it.seat || 450;
      box(g, w, 40, d, 0, seat - 20, 0, c);
      legs(g, w, d, seat - 40, 35, 30, shade(c, 0.8));
      box(g, w, h - seat, 30, 0, seat + (h - seat) / 2, -d / 2 + 15, c);
      break;
    }
    case 'bed': {
      box(g, w, 300, d, 0, 150, 0, shade(c, 0.6));
      box(g, w - 40, h - 300, d - 40, 0, 300 + (h - 300) / 2, 0, c);
      box(g, w, 1000, 80, 0, 500, -d / 2 - 40, shade(c, 0.6));
      box(g, w * 0.35, 120, 400, -w * 0.22, h + 60, -d / 2 + 260, '#ffffff');
      box(g, w * 0.35, 120, 400, w * 0.22, h + 60, -d / 2 + 260, '#ffffff');
      break;
    }
    case 'sectional': {
      // L-shaped corner sofa: seat along the back, open-ended chaise on one side,
      // a short side back over the corner and an arm on the far end.
      // Built with the chaise on the left (-x), then mirrored when chaise === 'right'.
      const s = new THREE.Group();
      g.add(s);
      if (it.chaise === 'right') s.scale.x = -1;
      const legH = it.legs ?? 180, seat = it.seat ?? 480, armH = it.armH ?? 650;
      const mainD = Math.min(it.seatD ?? 950, d), chW = Math.min(it.chaiseW ?? 1100, w - 400);
      const sideLen = Math.min(it.sideBack ?? 1100, d);
      const backT = 180, armW = 160, cush = 110, base = seat - cush;
      const x0 = -w / 2, z0 = -d / 2;
      const light = shade(c, 1.12), dark = '#1c1c1c';
      // bases
      box(s, w, base - legH, mainD, 0, (legH + base) / 2, z0 + mainD / 2, c);
      box(s, chW, base - legH, d - mainD, x0 + chW / 2, (legH + base) / 2, z0 + mainD + (d - mainD) / 2, c);
      // back, side back and arm
      box(s, w - armW, h - base, backT, x0 + (w - armW) / 2, (base + h) / 2, z0 + backT / 2, c);
      box(s, backT, h - base - 40, sideLen - backT, x0 + backT / 2, (base + h - 40) / 2, z0 + backT + (sideLen - backT) / 2, c);
      box(s, armW, armH - legH, mainD, w / 2 - armW / 2, (legH + armH) / 2, z0 + mainD / 2, c);
      // seat cushions: three along the main run, one on the chaise
      const runX0 = x0 + chW, runX1 = w / 2 - armW, n = 3, cw = (runX1 - runX0) / n;
      for (let i = 0; i < n; i++) {
        box(s, cw - 12, cush, mainD - backT - 10, runX0 + cw * (i + 0.5), base + cush / 2, z0 + backT + (mainD - backT) / 2, light);
      }
      box(s, chW - backT - 12, cush, sideLen - backT, x0 + backT + (chW - backT) / 2, base + cush / 2, z0 + backT + (sideLen - backT) / 2, light);
      box(s, chW - 12, cush, d - sideLen - 10, x0 + chW / 2, base + cush / 2, z0 + sideLen + (d - sideLen) / 2, light);
      // back cushions
      for (let i = 0; i < n; i++) {
        box(s, cw - 16, h - seat - 30, 150, runX0 + cw * (i + 0.5), seat + (h - seat - 30) / 2, z0 + backT + 75, light);
      }
      box(s, chW - backT - 16, h - seat - 30, 150, x0 + backT + (chW - backT) / 2, seat + (h - seat - 30) / 2, z0 + backT + 75, light);
      box(s, 150, h - seat - 70, sideLen - backT - 170, x0 + backT + 75, seat + (h - seat - 70) / 2, z0 + backT + 170 + (sideLen - backT - 170) / 2, light);
      // legs
      const legsAt = [[x0 + 60, z0 + 60], [w / 2 - 60, z0 + 60], [w / 2 - 60, z0 + mainD - 60],
        [x0 + chW - 60, z0 + mainD - 60], [x0 + 60, d / 2 - 60], [x0 + chW - 60, d / 2 - 60]];
      for (const [lx, lz] of legsAt) box(s, 45, legH, 45, lx, legH / 2, lz, dark);
      break;
    }
    case 'stairs': {
      // a straight flight rising from the front (+z) to the back (-z)
      const steps = Math.max(2, Math.round(h / 200));
      const rise = h / steps, run = d / steps;
      for (let i = 0; i < steps; i++) {
        box(g, w, rise * (i + 1), run, 0, (rise * (i + 1)) / 2, d / 2 - run * (i + 0.5), c);
      }
      break;
    }
    case 'rug':
      box(g, w, Math.max(h, 5), d, 0, Math.max(h, 5) / 2, 0, c);
      break;
    case 'base-unit':
      baseUnit(g, it);
      break;
    case 'sink-unit':
      baseUnit(g, it);
      box(g, w * 0.75, 12, d * 0.6, 0, h - 5, 0, '#a9b1b8', { metalness: 0.6, roughness: 0.3 });
      box(g, 30, 250, 30, 0, h + 125, -d * 0.3, '#a9b1b8', { metalness: 0.6, roughness: 0.3 });
      break;
    case 'hob-unit':
      baseUnit(g, it);
      box(g, w * 0.9, 8, d * 0.85, 0, h + 2, 0, '#111111', { roughness: 0.2 });
      break;
    case 'wall-unit':
      box(g, w, h, d - 18, 0, h / 2, -9, CARCASS);
      box(g, w - 4, h - 4, 18, 0, h / 2, d / 2 - 9, c);
      break;
    case 'tall-unit': {
      const plinth = 100;
      box(g, w - 10, plinth, d - 70, 0, plinth / 2, -35, '#3a3a3a');
      box(g, w, h - plinth, d - 20, 0, plinth + (h - plinth) / 2, -10, CARCASS);
      const lower = (h - plinth) * 0.6;
      box(g, w - 4, lower - 4, 18, 0, plinth + lower / 2, d / 2 - 9, c);
      box(g, w - 4, h - plinth - lower - 4, 18, 0, plinth + lower + (h - plinth - lower) / 2, d / 2 - 9, c);
      break;
    }
    case 'leg-machine':
      legMachine(g, it);
      break;
    case 'walking-pad':
      walkingPad(g, it);
      break;
    case 'hyper-bench':
      hyperBench(g, it);
      break;
    case 'cable-rack':
      cableRack(g, it);
      break;
    case 'cabinet':
      cabinet(g, it);
      break;
    case 'french-door-fridge': {
      // American-style fridge freezer: two fridge doors over a freezer drawer.
      const feet = 25, gap = 8, door = 40;
      box(g, w, h - feet, d - door, 0, feet + (h - feet) / 2, -door / 2, shade(c, 0.88));
      // dark panel just behind the doors, seen only through the gaps between them
      box(g, w - 2, h - feet - 2, 4, 0, feet + (h - feet) / 2, d / 2 - door - 1, '#1e1f21');
      const drawerTop = feet + (h - feet) * 0.36;
      const metal = { roughness: 0.45 };
      // freezer drawer
      box(g, w - 2 * gap, drawerTop - feet - gap, door, 0, feet + (drawerTop - feet - gap) / 2, d / 2 - door / 2, c, metal);
      // left and right fridge doors
      const doorH = h - drawerTop - gap, dw = w / 2 - 1.5 * gap;
      for (const sx of [-1, 1]) {
        box(g, dw, doorH, door, sx * (gap / 2 + dw / 2), drawerTop + gap + doorH / 2 - gap / 2, d / 2 - door / 2, c, metal);
      }
      // ice & water dispenser on the right door
      box(g, w * 0.16, doorH * 0.16, 8, w * 0.33, drawerTop + doorH * 0.45, d / 2 + 4, '#151515', { roughness: 0.3 });
      // feet
      for (const sx of [-1, 1]) box(g, 40, feet, 40, sx * (w / 2 - 40), feet / 2, d / 2 - 60, '#111111');
      break;
    }
    case 'appliance':
      box(g, w, h, d, 0, h / 2, 0, c, { roughness: 0.4, metalness: 0.2 });
      box(g, w * 0.04, h * 0.3, 20, w * 0.4, h * 0.6, d / 2 + 10, '#888888', { metalness: 0.6 });
      break;
    default:
      box(g, w, h, d, 0, h / 2, 0, c);
  }
  return g;
}
