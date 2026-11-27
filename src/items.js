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

// Oak-framed lounge armchair with leather seat and back cushions, drawn at 610 W x 1010 D x 860 H
// (seat 440) from side-on photos and stretched to the item's w/d/h. +z is the front.
function loungeChair(it) {
  const outer = new THREE.Group(), g = new THREE.Group();
  outer.add(g);
  g.scale.set(it.w / 610, it.h / 860, it.d / 1010);
  const oak = it.frame || '#d6a35f', c = it.color || '#8a4a32', seam = shade(c, 0.7);
  const seat = (it.seat ?? 440) * 860 / it.h;                // seat height in the drawn model
  for (const side of [-1, 1]) {
    const x = side * (610 / 2 - 22);
    strut(g, x, [0, 460], [560, 435], 40, 50, oak);          // front leg
    strut(g, x, [0, -368], [560, -320], 40, 55, oak);        // back leg
    strut(g, x, [540, -320], [860, -496], 40, 55, oak);      // back post, reclined
    strut(g, x, [230, -330], [230, 455], 40, 55, oak);       // side seat rail
    box(g, 50, 32, 860, side * (610 / 2 - 25), 575, 75, oak); // arm, past the front leg
  }
  box(g, 610 - 80, 50, 40, 0, 230, 440, oak);                // front cross rail
  box(g, 610 - 80, 50, 40, 0, 230, -320, oak);               // back cross rail
  const cw = 610 - 90;
  // seat cushion, channel-stitched across
  const sd = 700, st = 140, sz = 440 - sd / 2;
  box(g, cw, st, sd, 0, seat - st / 2, sz, c);
  for (let i = 1; i < 6; i++) box(g, cw + 2, 4, 4, 0, seat + 1, sz - sd / 2 + (sd / 6) * i, seam);
  box(g, 4, 4, sd, 0, seat + 1, sz, seam);
  // back cushion leaning with the back posts
  const b0 = [seat - 60, -230], b1 = [860, -430], len = Math.hypot(b1[0] - b0[0], b1[1] - b0[1]);
  const back = new THREE.Group();
  back.position.set(0, ((b0[0] + b1[0]) / 2) * S, ((b0[1] + b1[1]) / 2) * S);
  back.rotation.x = Math.atan2(b1[1] - b0[1], b1[0] - b0[0]);
  g.add(back);
  box(back, cw, len, 150, 0, 0, 0, c);
  for (let i = 1; i < 6; i++) box(back, cw + 2, 4, 4, 0, -len / 2 + (len / 6) * i, 76, seam);
  box(back, 4, len, 4, 0, 0, 76, seam);
  return outer;
}

// Four-star swivel base: centre column up to y, arms reaching r from the centre. Local z = front.
function starBase(g, r, y, color = '#1d1d1f') {
  cyl(g, 35, y, 0, y / 2, 0, 'y', color, { metalness: 0.4, roughness: 0.4 });
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2, arm = new THREE.Group();
    arm.rotation.y = a;
    g.add(arm);
    const m = box(arm, 45, 35, r, 0, 45, r / 2, color, { metalness: 0.4, roughness: 0.4 });
    m.rotation.x = Math.atan2(30, r);                            // slopes down to the foot
    box(arm, 50, 15, 60, 0, 8, r - 30, '#111111');
  }
}

// Swivel lounge chair: star base, leather shell with a thick seat cushion, back reclined it.recline
// degrees (25) from vertical with a tufted cushion and a head roll, padded arm rests on the seat sides.
function swivelChair(g, it) {
  const { w, d, h } = it;
  const c = it.color || '#a8653a', shell = shade(c, 0.85), seam = shade(c, 0.7);
  const seatH = it.seat ?? 420, cush = 150, rec = THREE.MathUtils.degToRad(it.recline ?? 25);
  const trayY = seatH - cush - 40;                                 // underside of the seat cushion
  starBase(g, Math.min(w, d) * 0.45, trayY - 30);
  // back, reclined from the tray: shell, tufted cushion and a head roll. Its top-rear corner
  // touches the back of the footprint.
  const bt = 130, st = 50, L = (h - trayY) / Math.cos(rec);
  const zb = -d / 2 + (bt + st) * Math.cos(rec) + L * Math.sin(rec);
  const back = new THREE.Group();
  back.position.set(0, trayY * S, zb * S);
  back.rotation.x = -rec;
  g.add(back);
  const bw = w - 200, headL = Math.min(230, L * 0.3);
  box(back, bw + 40, L, st, 0, L / 2, -bt - st / 2, shell);
  box(back, bw, L - headL - 20, bt, 0, (L - headL - 20) / 2, -bt / 2, c);
  box(back, bw - 20, headL, bt + 30, 0, L - headL / 2, -bt / 2 + 15, c);
  for (const x of [-bw / 5, bw / 5]) cyl(back, 14, 10, x, (L - headL) * 0.6, 3, 'z', seam);
  // seat: shell tray under everything, cushion from the back forwards, arm pads on the sides
  const front = d / 2 - 30, rear = zb - 60, sd = front - rear;
  box(g, w - 40, 50, d - 120, 0, trayY - 25, 0, shell);
  box(g, w - 80, cush, sd, 0, trayY + cush / 2, rear + sd / 2, c);
  box(g, w - 360, 4, 4, 0, trayY + cush + 1, rear + sd * 0.55, seam);   // tuft line
  for (const sx of [-1, 1]) {
    box(g, 170, 130, d * 0.5, sx * (w / 2 - 105), trayY + cush + 65, d * 0.15, c);  // arm pad
    box(g, 120, 70, 90, sx * (w / 2 - 105), trayY + cush - 10, 0, shell);            // its support
  }
}

// Matching swivel footstool: star base, shell tray and a deep cushion.
function swivelStool(g, it) {
  const { w, d, h } = it;
  const c = it.color || '#a8653a', shell = shade(c, 0.85), cush = Math.min(160, h * 0.4);
  starBase(g, Math.min(w, d) * 0.42, h - cush - 50);
  box(g, w - 30, 50, d - 30, 0, h - cush - 25, 0, shell);
  box(g, w - 60, cush, d - 60, 0, h - cush / 2, 0, c);
  box(g, w - 200, 4, 4, 0, h + 1, 0, shade(c, 0.7));
}

// Upholstered shell armchair on four splayed round wooden legs joined by an H-frame (Vedbo-style).
// The shell's back curves round into arms that run forward over the front legs; +z is the front.
function shellChair(g, it) {
  const { w, d, h } = it;
  const c = it.color || '#3f5a73', cushion = it.cushion || shade(c, 1.15), wood = it.frame || '#e3c99a';
  const seat = it.seat ?? 400, t = 55;                        // seat (cushion top) height, shell thickness
  const pan = seat - 50, armTop = Math.min(h - 120, seat + 230);
  const lx = w / 2 - 45;                                      // legs line up under the arms
  // legs: front legs rise into the arms, back legs splay out behind
  for (const sx of [-1, 1]) {
    strut(g, sx * lx, [0, d / 2 - 70], [pan + 120, d / 2 - 110], 44, 44, wood);
    strut(g, sx * (lx - 20), [0, -d / 2 + 50], [pan, -d / 2 + 210], 44, 44, wood);
    box(g, 30, 60, d - 230, sx * (lx - 10), 240, 0, wood);  // side rail
  }
  box(g, 2 * lx - 40, 60, 30, 0, 240, 0, wood);              // cross rail
  // seat pan and cushion
  box(g, w - 150, t, d - 170, 0, pan - t / 2, 20, c);
  box(g, w - 250, 50, d - 260, 0, pan + 25, 50, cushion);
  // back: three panels curving round, leaning back about 10 degrees
  const tilt = THREE.MathUtils.degToRad(10), bh = h - pan + 20;
  const panel = (x, z, len, rotY) => {
    const p = new THREE.Group();
    p.position.set(x * S, (pan - 20) * S, z * S);
    p.rotation.set(-tilt, rotY, 0, 'YXZ');
    g.add(p);
    box(p, len, bh, t, 0, bh / 2, 0, c);
  };
  const zb = -d / 2 + t / 2 + bh * Math.sin(tilt);
  panel(0, zb, w - 330, 0);
  for (const sx of [-1, 1]) panel(sx * (w / 2 - 110), zb + 70, 230, -sx * 0.6);
  // arms: wings from the back corners forward over the front legs, sloping down a little
  for (const sx of [-1, 1]) {
    const len = d - 230, a = new THREE.Group();
    a.position.set(sx * (w / 2 - t / 2 - 15) * S, (pan - 20) * S, (zb + 120 + len / 2) * S);
    a.rotation.x = Math.atan2(armTop - (armTop - 40), len) * -1;
    g.add(a);
    box(a, t, armTop - pan + 20, len, 0, (armTop - pan + 20) / 2, 0, c);
    box(a, t + 50, 50, len, sx * -10, armTop - pan - 5, 0, c);  // rolled top edge, flaring out
  }
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
// Side-by-side sections go between '|', e.g. "1d|1w/1w|1d" = door, two drawers, door.
// Options: it.legs (height, instead of a plinth), it.handle 'top'/'bottom'/'none',
// it.shaker (framed fronts), it.topFront (worktop overhang at the front, default 20), it.back (back panel colour).
const PLY = '#dcc39b';
function cabinet(g, it) {
  const T = 18;
  const { w, d, h } = it;
  const ply = it.carcass || PLY, front = it.color || '#b5654c';
  const legH = it.legs ?? 0, plinth = legH ? 0 : (it.plinth ?? 0), top = it.topT ?? 0;
  const y0 = legH || plinth, cH = h - y0 - top;
  const handle = (x, y) => { if (it.handle !== 'none') box(g, 100, 16, 4, x, y, d / 2 + 1, '#4a3a2e'); };
  const frontPanel = (cw, rh, xc, yc) => {
    box(g, cw - 4, rh - 4, T, xc, yc, d / 2 - T / 2, front);
    if (it.shaker && cw > 160 && rh > 160) {                 // raised frame around a recessed centre
      const f = 55, dark = shade(front, 0.9);
      box(g, cw - 4 - 2 * f, rh - 4 - 2 * f, 3, xc, yc, d / 2 + 2.5, dark); // sits just proud, no overlap
    }
  };
  if (plinth > 0) box(g, w - 4, plinth, d - 60, 0, plinth / 2, -30, shade(ply, 0.82));
  if (legH > 0) {
    const legC = it.legColor || '#1f1d1b', nx = w > 1300 ? 3 : 2;
    for (let i = 0; i < nx; i++) for (const sz of [-1, 1]) {
      const lx = nx === 2 ? (i ? 1 : -1) * (w / 2 - 60) : -w / 2 + 60 + (w - 120) * i / (nx - 1);
      box(g, 40, legH, 40, lx, legH / 2, sz * (d / 2 - 60), legC);
    }
  }
  // carcass panels: sides, base, top, back
  for (const sx of [-1, 1]) box(g, T, cH, d, sx * (w / 2 - T / 2), y0 + cH / 2, 0, ply);
  box(g, w - 2 * T, T, d, 0, y0 + T / 2, 0, ply);
  box(g, w - 2 * T, T, d, 0, y0 + cH - T / 2, 0, ply);
  box(g, w - 2 * T, cH - 2 * T, T, 0, y0 + cH / 2, -d / 2 + T / 2, it.back || shade(ply, 0.92));
  // sections side by side, each with its own rows
  const sections = String(it.fronts || '1d').split('|');
  const iwAll = w - 2 * T, secW = (iwAll - (sections.length - 1) * T) / sections.length;
  sections.forEach((spec, si) => {
    const xL = -iwAll / 2 + si * (secW + T);
    if (si > 0) box(g, T, cH - 2 * T, d - T, xL - T / 2, y0 + cH / 2, T / 2, ply);   // upright between sections
    drawRows(spec, xL, secW);
  });
  function drawRows(spec, xL, iw) {
    const rows = spec.split('/').map((r) => {
      const m = r.trim().match(/^(?:(\d+):)?(\d*)([dwobxvm])$/);
      return m ? { h: m[1] ? Number(m[1]) : null, n: Number(m[2] || 1), k: m[3] } : { h: null, n: 1, k: 'd' };
    });
    const inner = cH - 2 * T - (rows.length - 1) * T;
    const fixed = rows.reduce((a, r) => a + (r.h || 0), 0);
    const free = rows.filter((r) => !r.h).length;
    const share = free ? Math.max(50, (inner - fixed) / free) : 0;
    let yTop = y0 + cH - T;
    const xMid = xL + iw / 2;
    rows.forEach((r, ri) => {
      const rh = r.h || share;
      const yc = yTop - rh / 2;
      const open = 'obx'.includes(r.k);
      const cw = (iw - (open ? (r.n - 1) * T : 0)) / r.n;
      for (let i = 0; i < r.n; i++) {
        const xc = xL + cw / 2 + i * (cw + (open ? T : 0));
        if (open && i > 0) box(g, T, rh, d - T, xc - cw / 2 - T / 2, yc, T / 2, ply); // divider
        if (r.k === 'd' || r.k === 'w') {
          frontPanel(cw, rh, xc, yc);
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
      if (ri < rows.length - 1) box(g, iw, T, open ? d - T : d, xMid, yTop - rh - T / 2, open ? T / 2 : 0, ply); // rail/shelf
      yTop -= rh + T;
    });
  }
  // worktop, sink and hob
  if (top > 0) {
    const wt = it.worktop || '#e6e2da';
    const over = it.topFront ?? 20;
    box(g, w, top, d + over, 0, h - top / 2, over / 2, wt);
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

// ---------------------------------------------------------------- bedroom
const LINEN = '#f4f2ee', CHINA = '#f6f6f3', TAP = '#c9ced3';
const glass = { transparent: true, opacity: 0.25, roughness: 0.05 };

// Bed frame. w/d is the whole frame, headboard included; the mattress is it.mattressW x it.mattressD
// (UK sizes), centred across the width with the headboard at the back (-z).
function bed(g, it) {
  const { w, d, h } = it;
  const c = it.color || '#b9a48a';
  const head = it.headboard ?? 1050, hbT = 60, rail = 30;
  const mW = Math.min(it.mattressW ?? w - 60, w), mD = Math.min(it.mattressD ?? d - hbT - rail, d - hbT);
  const base = Math.max(150, h - 250);                 // top of the base / bottom of the mattress
  const mz = -d / 2 + hbT + mD / 2;
  box(g, w, base - 60, d - hbT, 0, 60 + (base - 60) / 2, hbT / 2, c);   // base / divan
  legs(g, w, d - hbT, 60, 50, 50, shade(c, 0.6));
  g.children.slice(-4).forEach((m) => { m.position.z += (hbT / 2) * S; });
  box(g, w, head, hbT, 0, head / 2, -d / 2 + hbT / 2, c);               // headboard
  box(g, mW - 10, h - base, mD - 10, 0, base + (h - base) / 2, mz, LINEN); // mattress
  box(g, mW - 20, 40, mD * 0.62, 0, h + 20, mz + mD * 0.19, shade(c, 1.2)); // duvet over the lower part
  const pillows = mW >= 1200 ? 2 : 1, pw = (mW - 120) / pillows;
  for (let i = 0; i < pillows; i++) {
    box(g, pw - 40, 130, 420, -mW / 2 + 60 + pw * (i + 0.5), h + 65, -d / 2 + hbT + 260, '#ffffff');
  }
}

// Sliding-door wardrobe: carcass with it.doors panels on two staggered tracks.
function slidingWardrobe(g, it) {
  const { w, d, h } = it;
  const c = it.color || '#e8e4dc', frame = it.frame || '#9a9ea3';
  const n = Math.max(2, it.doors ?? 2), track = 30, front = 2 * track + 20;
  box(g, w, h, d - front, 0, h / 2, -front / 2, it.carcass || CARCASS);
  box(g, w, 40, front, 0, h - 20, d / 2 - front / 2, frame);     // top track
  box(g, w, 20, front, 0, 10, d / 2 - front / 2, frame);         // bottom track
  const pw = w / n + 25;
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + (w / n) * (i + 0.5);
    const z = d / 2 - (i % 2 ? track * 1.5 + 10 : track / 2 + 5);
    const mirror = it.mirror && i % 2 === 1;
    box(g, pw - 4, h - 70, 20, x, 20 + (h - 70) / 2, z, mirror ? '#c7d2d8' : c, mirror ? { metalness: 0.6, roughness: 0.1 } : undefined);
    for (const sx of [-1, 1]) box(g, 22, h - 70, 24, x + sx * (pw / 2 - 11), 20 + (h - 70) / 2, z, frame);
  }
}

// Dressing table: legged table with a drawer apron and a mirror at the back.
function dressingTable(g, it) {
  const { w, d, h } = it;
  const c = it.color || '#d9c7a7';
  box(g, w, 25, d, 0, h - 12, 0, c);
  box(g, w - 80, 140, d - 40, 0, h - 25 - 70, 0, c);
  for (const sx of it.drawers === 1 ? [0] : [-1, 1]) {
    box(g, (w - 140) / (it.drawers === 1 ? 1 : 2), 110, 18, sx * (w - 80) / 4, h - 95, d / 2 - 10, shade(c, 1.06));
    box(g, 60, 12, 6, sx * (w - 80) / 4, h - 95, d / 2 + 2, '#4a3a2e');
  }
  legs(g, w, d, h - 25, 40, 40, shade(c, 0.85));
  const mh = it.mirrorH ?? 700, mw = Math.min(w * 0.6, 700);
  if (it.mirror === 'round') {          // round mirror on the wall above the table
    const r = Math.min(mw, mh) / 2;
    cyl(g, r + 15, 15, 0, h + 250 + r, -d / 2 + 8, 'z', shade(c, 0.9));
    cyl(g, r, 6, 0, h + 250 + r, -d / 2 + 18, 'z', '#c7d2d8', { metalness: 0.6, roughness: 0.1 });
    return;
  }
  box(g, mw + 40, mh + 40, 20, 0, h + mh / 2 + 20, -d / 2 + 40, shade(c, 0.9));
  box(g, mw, mh, 6, 0, h + mh / 2 + 20, -d / 2 + 52, '#c7d2d8', { metalness: 0.6, roughness: 0.1 });
}

// Desk: top and legs, with an optional drawer pedestal on one side ('left'/'right'/'none').
function desk(g, it) {
  const { w, d, h } = it;
  const c = it.color || '#c9b79c';
  box(g, w, 25, d, 0, h - 12, 0, c);
  const ped = it.pedestal || 'none', pw = 400;
  if (ped === 'none') {
    legs(g, w, d, h - 25, 45, 40, shade(c, 0.8));
  } else {
    const sx = ped === 'left' ? -1 : 1, px = sx * (w / 2 - pw / 2 - 10);
    box(g, pw, h - 25, d - 40, px, (h - 25) / 2, -10, shade(c, 0.95));
    const dh = (h - 25 - 40) / 3;
    for (let i = 0; i < 3; i++) {
      box(g, pw - 10, dh - 6, 18, px, 20 + dh * (i + 0.5), d / 2 - 20, shade(c, 1.05));
      box(g, 80, 12, 6, px, 20 + dh * (i + 0.5) + dh / 2 - 40, d / 2 - 8, '#4a4a4a');
    }
    for (const sz of [-1, 1]) box(g, 45, h - 25, 45, -sx * (w / 2 - 40), (h - 25) / 2, sz * (d / 2 - 40), shade(c, 0.8));
    box(g, w - pw - 60, 300, 18, -sx * (pw / 2), h - 25 - 150, -d / 2 + 30, shade(c, 0.9)); // modesty panel
  }
}

// Mid-sleeper cabin bed with a pull-out desk (local x = length, +z = front).
// The bed frame is closedD deep at the back of the footprint; with extension 'extended' the item is
// openD deep and the desk unit at the right-hand end is pulled out to the front edge.
function midSleeper(g, it) {
  const { w, d, h } = it;
  const c = it.color || '#8e9196', dark = shade(c, 0.85), post = 70;
  const D = Math.min(it.closedD ?? 1050, d), zb = -d / 2, zf = zb + D;      // frame back / front
  const deck = it.deck ?? 780, mattD = it.mattressH ?? 150;
  const xL = -w / 2, xR = w / 2;
  // posts and end panels (top rail, bottom rail, slats)
  for (const x of [xL + post / 2, xR - post / 2]) for (const z of [zb + post / 2, zf - post / 2]) box(g, post, h, post, x, h / 2, z, c);
  for (const x of [xL + post / 2, xR - post / 2]) {
    box(g, 40, 90, D - post, x, h - 45, zb + D / 2, c);
    box(g, 40, 90, D - post, x, deck - 45, zb + D / 2, c);
    const n = 6, span = D - 2 * post;
    for (let i = 0; i < n; i++) box(g, 30, h - deck - 90, 60, x, deck + (h - deck - 90) / 2, zb + post + span * (i + 0.5) / n, c);
    box(g, 40, 90, D - post, x, 380, zb + D / 2, c);                        // low rail
  }
  // deck, side rails and guard rails
  box(g, w - 2 * post, 40, D - 2 * post, 0, deck - 20, zb + D / 2, dark);
  for (const z of [zb + 20, zf - 20]) box(g, w - 2 * post, 110, 40, 0, deck - 55, z, c);
  box(g, w - 2 * post, 80, 40, 0, h - 40, zb + 20, c);                       // back guard rail
  const lx = xL + post + 560, lw = 320;                                      // ladder position and width
  box(g, lx - lw / 2 - xL - post, 80, 40, (xL + post + lx - lw / 2) / 2, h - 40, zf - 20, c);   // front rail left of ladder
  box(g, xR - post - (lx + lw / 2), 80, 40, (lx + lw / 2 + xR - post) / 2, h - 40, zf - 20, c); // front rail right of ladder
  box(g, xR - post - (lx + lw / 2), 70, 40, (lx + lw / 2 + xR - post) / 2, (deck + h) / 2, zf - 20, c);
  // mattress and pillow
  box(g, Math.min(1900, w - 2 * post), mattD, Math.min(900, D - 2 * post), 0, deck + mattD / 2, zb + D / 2, '#f4f2ee');
  box(g, 500, 120, 340, xR - post - 300, deck + mattD + 60, zb + D / 2, '#ffffff');
  // ladder: two stiles and rungs, flush with the front
  for (const sx of [-1, 1]) box(g, 45, deck + 300, 70, lx + sx * (lw / 2 - 22), (deck + 300) / 2, zf + 15, c);
  for (const y of [300, 560]) box(g, lw - 45, 30, 90, lx, y, zf + 15, c);
  // storage cubes: open shelf over a pull-out drawer box
  const cube = (x0, cw) => {
    const ch = deck - 80, cd = D - 120, cz = zb + 60 + cd / 2, xc = x0 + cw / 2;
    box(g, cw, 18, cd, xc, ch, cz, c);                                       // top
    for (const sx of [-1, 1]) box(g, 18, ch, cd, xc + sx * (cw / 2 - 9), ch / 2, cz, c);
    box(g, cw, ch, 12, xc, ch / 2, cz - cd / 2 + 6, dark);                   // back
    box(g, cw - 36, 18, cd, xc, ch * 0.55, cz, c);                           // shelf
    box(g, cw - 40, ch * 0.5, cd - 20, xc, ch * 0.25 + 10, cz + 10, shade(c, 1.05)); // drawer box
    box(g, 140, 30, 8, xc, ch * 0.5 - 50, cz + cd / 2 + 5, '#3a3a3a');        // hand hole
  };
  cube(xL + post + 10, lx - lw / 2 - (xL + post) - 20);
  const mx0 = lx + lw / 2 + 10, mw = 470;
  cube(mx0, mw);
  // desk unit on castors at the right-hand end, pulled to the front edge when extended
  const dw = xR - post - (mx0 + mw) - 20, ddp = Math.min(it.deskD ?? 900, D - 60), dx = (mx0 + mw + 10 + xR - post - 10) / 2;
  const dzf = it.extension === 'extended' ? d / 2 : zf - 20, dz = dzf - ddp / 2, dh = Math.min(720, deck - 60);
  box(g, dw, 20, ddp, dx, dh - 10, dz, c);                                   // desk top
  const uw = dw * 0.95, ud = ddp * 0.55, uz = dzf - ud / 2 - 10;             // 2 x 2 cubby unit under the front
  for (const sx of [-1, 0, 1]) box(g, 18, dh - 60, ud, dx + sx * (uw / 2 - 9), (dh - 60) / 2 + 40, uz, c);
  for (const y of [40, (dh - 20) / 2 + 20]) box(g, uw, 18, ud, dx, y + 9, uz, c);
  box(g, 18, dh - 60, ddp - ud - 30, dx - uw / 2 + 9, (dh - 60) / 2 + 40, dz - ddp / 2 + (ddp - ud - 30) / 2 + 10, c); // back leg panel
  for (const sx of [-1, 1]) for (const z of [uz - ud / 2 + 30, uz + ud / 2 - 30]) cyl(g, 18, 36, dx + sx * (uw / 2 - 30), 18, z, 'x', '#555555');
}

// Open cube shelf: it.cols x it.rows cubes of it.cell mm; panel thickness is whatever is left over.
function cubeShelf(g, it) {
  const { w, d, h } = it;
  const c = it.color || '#d9c4a5', cols = it.cols || 2, rows = it.rows || 4, cell = it.cell || 335;
  const tv = Math.max(12, (w - cols * cell) / (cols + 1)), th = Math.max(12, (h - rows * cell) / (rows + 1));
  for (let i = 0; i <= cols; i++) box(g, tv, h, d, -w / 2 + tv / 2 + i * (cell + tv), h / 2, 0, c);
  for (let j = 0; j <= rows; j++) box(g, w - 2 * tv, th, d, 0, th / 2 + j * (cell + th), 0, shade(c, j === rows || j === 0 ? 1 : 0.97));
}

// Stepped toy storage: columns of it.heights (mm, left to right) holding pull-out boxes.
function steppedStorage(g, it) {
  const { w, d } = it;
  const c = it.color || '#f2f2f0', bc = it.boxColor || '#fbfbf9', T = 18;
  const hs = String(it.heights || '940/680/430').split('/').map(Number), n = hs.length, cw = (w - (n + 1) * T) / n;
  const bh = it.boxH || 230, bw = it.boxW || 300, bd = Math.min(it.boxD || 420, d - 20);
  const boxColors = it.boxColors ? String(it.boxColors).split(',').map((x) => x.trim()) : null;
  for (let i = 0; i <= n; i++) {                              // side panels step down with the columns
    const hh = Math.max(hs[Math.min(i, n - 1)], i > 0 ? hs[i - 1] : 0);
    box(g, T, hh, d, -w / 2 + T / 2 + i * (cw + T), hh / 2, 0, c);
  }
  hs.forEach((hh, i) => {
    const x = -w / 2 + T + cw / 2 + i * (cw + T);
    box(g, cw, T, d, x, hh - T / 2, 0, c);                    // top
    box(g, cw, 30, d - 20, x, 15, -10, c);                    // plinth / base
    box(g, cw, 90, T, x, hh - T - 45, d / 2 - T / 2, c);      // top rail
    const avail = hh - T - 90 - 30, boxes = Math.max(1, Math.floor(avail / (bh + 20))), pitch = avail / boxes;
    for (let k = 0; k < boxes; k++) {
      const y = hh - T - 95 - k * pitch;                      // top of each box (rim)
      const kc = boxColors ? boxColors[(i * 5 + k) % boxColors.length] : bc;   // mixed colours if given
      box(g, bw + 20, 12, bd, x, y - 6, 10, kc);               // rim on its runners
      box(g, bw - 20, bh - 12, bd - 40, x, y - bh / 2 - 6, 10, kc);
    }
  });
}

// Chest of drawers on legs: framed carcass, overhanging top, it.drawers drawers with two knobs each.
function framedChest(g, it) {
  const { w, d, h } = it;
  const c = it.color || '#9fb5a5', top = it.top || '#c9a26b', knob = it.knob || '#d9b98a';
  const tt = 25, leg = 55, foot = it.legs ?? 130, fr = 40, n = it.drawers || 3;
  const bodyW = w - 40, bodyD = d - 20, y0 = foot, y1 = h - tt;
  box(g, w, tt, d, 0, h - tt / 2, 0, top);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, leg, y1, leg, sx * (bodyW / 2 - leg / 2), y1 / 2, sz * (bodyD / 2 - leg / 2) - 10, c);
  box(g, bodyW - 2 * leg, y1 - y0, bodyD - 40, 0, (y0 + y1) / 2, -30, shade(c, 0.9));           // carcass
  box(g, bodyW - 2 * leg, 60, 20, 0, y0 + 30, bodyD / 2 - 20, c);                                  // bottom rail
  box(g, bodyW - 2 * leg, 50, 20, 0, y1 - 25, bodyD / 2 - 20, c);                                  // top rail
  const span = y1 - 50 - (y0 + 60), gap = 25, dh = (span - (n + 1) * gap) / n;
  for (let i = 0; i < n; i++) {
    const yc = y1 - 50 - gap - dh / 2 - i * (dh + gap) - (i === n - 1 ? 0 : 0);
    box(g, bodyW - 2 * leg - 2 * fr / 2, dh, 22, 0, yc, bodyD / 2 - 9, c);
    if (i > 0) box(g, bodyW - 2 * leg, gap, 18, 0, yc + dh / 2 + gap / 2, bodyD / 2 - 20, c);
    for (const sx of [-1, 1]) cyl(g, 18, 25, sx * (bodyW / 2 - leg - 180), yc + 10, bodyD / 2 + 12, 'z', knob);
  }
}

// ---------------------------------------------------------------- bathroom
// Bath: rim, sunken tub floor, front panel and taps at the left (-x) end unless taps: 'right'.
function bath(g, it) {
  const { w, d, h } = it;
  const c = it.color || CHINA, rim = 70;
  box(g, w, h - 20, d, 0, (h - 20) / 2, 0, it.panel || '#ffffff');               // panelled body
  for (const sz of [-1, 1]) box(g, w, 20, rim, 0, h - 10, sz * (d / 2 - rim / 2), c);
  for (const sx of [-1, 1]) box(g, rim * 1.6, 20, d - 2 * rim, sx * (w / 2 - rim * 0.8), h - 10, 0, c);
  box(g, w - rim * 3.2, 4, d - 2 * rim, 0, h - 18, 0, '#c9dbe3', { roughness: 0.2 }); // tub (seen as water line)
  const tx = (it.taps === 'right' ? 1 : -1) * (w / 2 - rim * 0.8);
  cyl(g, 18, 160, tx, h + 80, -d / 2 + rim / 2, 'y', TAP, { metalness: 0.5, roughness: 0.25 });
  cyl(g, 14, 120, tx + (tx < 0 ? 60 : -60), h + 160, -d / 2 + rim / 2, 'x', TAP, { metalness: 0.5, roughness: 0.25 });
  // hinged bath screen along the front rim, from the tap (shower) end
  if (it.screen) box(g, 800, 1400, 10, Math.sign(tx) * (w / 2 - 400), h + 700, d / 2 - rim / 2, '#bfe0f0', glass);
}

// Shower tray, with an optional glass enclosure (screen: 'enclosure') on the front and on the side away
// from the wall (wall: 'right' puts the glass on the left side, 'left' on the right).
function showerTray(g, it) {
  const { w, d } = it;
  const c = it.color || CHINA, t = Math.max(25, it.h ?? 40);
  box(g, w, t, d, 0, t / 2, 0, c);
  cyl(g, 50, 4, 0, t + 1, 0, 'y', '#9aa0a6', { metalness: 0.5, roughness: 0.3 });
  if (it.screen === 'enclosure') {
    const sh = it.screenH ?? 1950, f = '#c9ced3';
    box(g, w, sh, 8, 0, t + sh / 2, d / 2 - 15, '#bfe0f0', glass);
    const gx = (it.wall === 'left' ? 1 : -1) * (w / 2 - 15);
    box(g, 8, sh, d, gx, t + sh / 2, 0, '#bfe0f0', glass);
    box(g, 20, sh, 20, gx, t + sh / 2, d / 2 - 15, f, { metalness: 0.5, roughness: 0.3 });
  }
  // riser rail and head on the back wall
  box(g, 25, 900, 25, 0, 1300, -d / 2 + 30, TAP, { metalness: 0.5, roughness: 0.25 });
  cyl(g, 60, 15, 0, 1850, -d / 2 + 120, 'y', TAP, { metalness: 0.5, roughness: 0.25 });
}

// Toilet: oval pan and seat. style 'close-coupled' (default) has a cistern against the back wall;
// 'wall-hung' has the pan off the floor in front of a tiled boxing (h high) hiding the cistern.
function toilet(g, it) {
  const { w, d, h } = it;
  const hung = it.style === 'wall-hung';
  const c = it.color || CHINA, seatH = it.seat ?? 410, cisD = it.cisternD ?? (hung ? 200 : 180);
  const bowlD = d - cisD + 40;
  const bowl = (y, hh, rw, rd, color) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, hh * S, 28), mat(color));
    m.scale.set(rw * S, 1, rd * S);
    m.position.set(0, y * S, (d / 2 - bowlD / 2) * S);
    m.castShadow = m.receiveShadow = true;
    g.add(m);
  };
  if (hung) {
    bowl(seatH - 190, 260, w * 0.85, bowlD * 0.95, c);                       // pan, clear of the floor
    box(g, w, h, cisD, 0, h / 2, -d / 2 + cisD / 2, it.boxing || '#eeeeea'); // boxing over the cistern
    box(g, 160, 100, 6, 0, Math.min(h - 120, 1000), -d / 2 + cisD + 3, TAP, { metalness: 0.5 }); // flush plate
  } else {
    bowl((seatH - 60) / 2, seatH - 60, w * 0.6, bowlD * 0.75, c);            // pedestal
    bowl(seatH - 60 + 25, 50, w * 0.95, bowlD, c);                           // rim
  }
  bowl(seatH - 6, 22, w * (hung ? 0.9 : 1), bowlD + 10, it.seatColor || '#ffffff'); // seat
  if (!hung) {
    box(g, w, h - seatH + 40, cisD, 0, seatH - 40 + (h - seatH + 40) / 2, -d / 2 + cisD / 2, c);
    box(g, w + 10, 20, cisD + 10, 0, h - 10, -d / 2 + cisD / 2, c);         // cistern lid
    cyl(g, 22, 8, 0, h + 4, -d / 2 + cisD / 2, 'y', TAP, { metalness: 0.5 }); // flush button
  }
}

// Basin on a pedestal (it.pedestal false for wall-hung).
function basin(g, it) {
  const { w, d, h } = it;
  const c = it.color || CHINA, bt = 170;
  if (it.pedestal !== false) box(g, w * 0.32, h - bt, d * 0.4, 0, (h - bt) / 2, -d / 2 + d * 0.25, c);
  basinTop(g, w, d, h, bt, c);
}

// basin top w wide; the bowl (bw wide, default the whole top) is centred at bx
function basinTop(g, w, d, h, bt, c, bx = 0, bw = w) {
  box(g, w, bt, d, 0, h - bt / 2, 0, c);
  box(g, Math.min(bw, 600) - 90, 6, d - 140, bx, h - 1, 25, '#d9dde0', { roughness: 0.3 });   // bowl
  cyl(g, 15, 140, bx, h + 70, -d / 2 + 45, 'y', TAP, { metalness: 0.5, roughness: 0.25 });
  cyl(g, 11, 110, bx, h + 135, -d / 2 + 95, 'z', TAP, { metalness: 0.5, roughness: 0.25 });
}

// Vanity unit: a cabinet (fronts as for 'cabinet') with a ceramic basin top.
// basinAt moves the basin along the unit (mm from the centre, + to the right).
function vanity(g, it) {
  const bt = 40;
  cabinet(g, { ...it, h: it.h - bt, plinth: it.plinth ?? 0, topT: 0, fronts: it.fronts || '2d', carcass: it.carcass || it.color });
  basinTop(g, it.w, it.d, it.h, bt, it.basinColor || CHINA, it.basinAt || 0, 600);
}

// Glass-block wall panel: w long, d thick, h high, in blocks of it.block (190) mm.
function glassBlock(g, it) {
  const { w, d, h } = it;
  const b = it.block || 190, nx = Math.max(1, Math.round(w / b)), ny = Math.max(1, Math.round(h / b));
  const bw = w / nx, bh = h / ny;
  box(g, w, h, d * 0.5, 0, h / 2, 0, '#d9e4e6');                              // mortar core
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    box(g, bw - 10, bh - 10, d, -w / 2 + bw * (i + 0.5), bh * (j + 0.5), 0, it.color || '#bcd8de', { transparent: true, opacity: 0.75, roughness: 0.1 });
  }
}

const STEEL = '#1d1d1f', PAD = '#202022', CHROME = '#c8ccd0';

// Seated leg extension / curl machine (user faces +z, rollers at the front).
// Mobile workbench / table-saw station: plywood top on a 2x4 frame with casters, a drawer bank
// at one end of the front, an open lower shelf, and a benchtop table saw dropped in flush with the
// top at the other end (it.saw = 'right' | 'left' | 'none', as you face the front).
// Plywood bookshelf with staggered shelves that overhang alternately left and right, offset
// uprights in each tier, a row of drawers near the top, low book dividers on top, tapered legs.
function staggerShelf(g, it) {
  const { w, d, h } = it, c = it.color || '#e4d0a8', T = 18, legH = it.legs ?? 150;
  const edge = shade(c, 0.9), notch = shade(c, 0.6);
  // shelf heights from the floor: base, two book tiers, a drawer tier, then the top
  const ys = [legH, legH + (h - legH) * 0.34, legH + (h - legH) * 0.64, legH + (h - legH) * 0.84];
  const shelfW = w * 0.9, shift = w * 0.05;
  ys.forEach((y, i) => box(g, shelfW, T, d, (i % 2 ? 1 : -1) * shift, y + T / 2, 0, c));
  // uprights for each tier, offset so they don't line up (fractions across the width)
  const tiers = [[0.08, 0.3, 0.6, 0.82], [0.12, 0.3, 0.43, 0.65, 0.9], [0.1, 0.42, 0.55, 0.7, 0.92]];
  tiers.forEach((xs, i) => {
    const yA = ys[i] + T, yB = ys[i + 1], hh = yB - yA;
    for (const f of xs) box(g, T, hh, d, -w / 2 + w * f, yA + hh / 2, 0, c);
    box(g, w * (xs[xs.length - 1] - xs[0]), hh, 6, -w / 2 + w * (xs[0] + xs[xs.length - 1]) / 2, yA + hh / 2, -d / 2 + 3, edge); // back
  });
  // drawers in the drawer tier (wide, small, [open], medium)
  const xs = tiers[2], yA = ys[2] + T, hh = ys[3] - yA;
  [[0, 1], [1, 2], [3, 4]].forEach(([a, b]) => {
    const x0 = -w / 2 + w * xs[a] + T / 2, x1 = -w / 2 + w * xs[b] - T / 2;
    box(g, x1 - x0 - 6, hh - 8, T, (x0 + x1) / 2, yA + hh / 2, d / 2 - T / 2, c);
    box(g, Math.min(90, (x1 - x0) * 0.3), 20, 4, (x0 + x1) / 2, yA + hh - 18, d / 2 + 1, notch); // finger notch
  });
  // low book dividers on top
  const top = ys[3] + T, divH = h - top;
  for (const f of [0.12, 0.25, 0.38, 0.55, 0.78, 0.92]) box(g, T, divH, d * 0.7, -w / 2 + w * f, top + divH / 2, -d * 0.15, c);
  // tapered legs
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = box(g, 32, legH, 32, sx * (w / 2 - w * 0.13), legH / 2, sz * (d / 2 - 60), it.legColor || '#c9a06a');
    leg.rotation.z = sx * 0.06;
  }
}

// Kitchen-style trolley: black steel frame on casters, two lower shelves and a plywood tray on top.
function trolley(g, it) {
  const { w, d, h } = it, frame = it.color || '#1e1e20', tray = it.tray || '#d9a868', post = 35, wheel = 90;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(g, post, h - wheel - 80, post, sx * (w / 2 - post / 2 - 30), wheel + (h - wheel - 80) / 2, sz * (d / 2 - post / 2 - 30), frame);
    cyl(g, 35, 25, sx * (w / 2 - 50), 35, sz * (d / 2 - 50), 'x', '#2a2a2a');
    box(g, 30, wheel - 60, 30, sx * (w / 2 - 50), 60 + (wheel - 60) / 2, sz * (d / 2 - 50), '#9a9da2');
  }
  for (const y of [wheel + 200, wheel + 520]) box(g, w - 80, 20, d - 80, 0, y, 0, frame);        // lower shelves
  for (const sz of [-1, 1]) box(g, w - 80, 40, 20, 0, h - 100, sz * (d / 2 - 40), frame);         // top rails
  // plywood tray with raised sides sitting on the frame
  const ty = h - 80, rim = 80;
  box(g, w, 15, d, 0, ty + 7, 0, tray);
  for (const sz of [-1, 1]) box(g, w, rim, 15, 0, ty + rim / 2, sz * (d / 2 - 7), tray);
  for (const sx of [-1, 1]) box(g, 15, rim, d, sx * (w / 2 - 7), ty + rim / 2, 0, tray);
}

function sawBench(g, it) {
  const { w, d, h } = it, ply = it.color || '#e3cb9f', stud = shade(ply, 1.04), T = 19, post = 89;
  const caster = 100, x0 = -w / 2, z0 = -d / 2;
  const sawSide = it.saw === 'left' ? -1 : it.saw === 'none' ? 0 : 1;
  const sawW = it.sawW ?? 560, sawD = it.sawD ?? 600;              // saw table footprint
  // casters
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(g, 60, caster - 30, 60, sx * (w / 2 - 80), (caster - 30) / 2 + 20, sz * (d / 2 - 80), '#2b2b2e');
    cyl(g, 30, 30, sx * (w / 2 - 80), 30, sz * (d / 2 - 80), 'x', '#1a1a1a');
  }
  // base platform and lower shelf
  box(g, w - 40, T + 70, d - 40, 0, caster + (T + 70) / 2, 0, stud);
  // posts (2x4 doubled) around the frame
  const postsX = [x0 + 60, x0 + w * 0.36, w / 2 - 60 - (sawSide === 1 ? sawW : 0), w / 2 - 60];
  const postsXl = sawSide === -1 ? [x0 + 60, x0 + 60 + sawW, w / 2 - w * 0.36, w / 2 - 60] : postsX;
  for (const px of postsXl) for (const sz of [-1, 1]) box(g, post, h - T - caster - 89, 64, px, (caster + 89 + h - T) / 2, sz * (d / 2 - 50), stud);
  // top rails
  for (const sz of [-1, 1]) box(g, w - 40, 89, 38, 0, h - T - 45, sz * (d / 2 - 30), stud);
  // drawer bank at the opposite end to the saw: two columns, 3 drawers and 2 drawers + open bin
  const bankW = w * 0.36 - 60, bx0 = sawSide === -1 ? w / 2 - 60 - bankW : x0 + 60;
  const colW = bankW / 2, top = h - T - 89, bot = caster + 89, rowH = (top - bot) / 3;
  box(g, bankW, top - bot, d * 0.5, bx0 + bankW / 2, (top + bot) / 2, d / 2 - d * 0.25 - 30, shade(ply, 0.88)); // carcass
  for (let c = 0; c < 2; c++) for (let r = 0; r < 3; r++) {
    const cx = bx0 + colW * (c + 0.5), cy = bot + rowH * (r + 0.5);
    if (c === 1 && r === 0) box(g, colW - 30, rowH * 0.6, 18, cx, bot + rowH * 0.3 + 10, d / 2 - 30, ply); // low-front bin
    else box(g, colW - 30, rowH - 25, 18, cx, cy, d / 2 - 30, ply);
  }
  // back panel behind the open bay and a clamp rail along the front
  box(g, w - 80, top - bot - 40, T, 0, (top + bot) / 2, -d / 2 + 40, shade(ply, 0.9));
  cyl(g, 18, w * 0.4, 0, top - 60, d / 2 - 30, 'x', shade(ply, 0.95));
  // worktop, with a cut-out for the saw
  if (sawSide) {
    const sx = sawSide * (w / 2 - sawW / 2), rest = w - sawW;
    box(g, rest, T, d, -sawSide * sawW / 2, h - T / 2, 0, ply);                          // main top
    box(g, sawW, T, d - sawD, sx, h - T / 2, d / 2 - (d - sawD) / 2, ply);              // strip in front of the saw
    // the saw: grey cast table flush with the top, yellow body underneath, fence, blade guard
    box(g, sawW - 10, 25, sawD - 10, sx, h - 12, z0 + sawD / 2, '#9da1a6', { metalness: 0.4, roughness: 0.35 });
    box(g, sawW - 80, 300, sawD - 120, sx, h - 25 - 150, z0 + sawD / 2, '#f0b323');
    box(g, 40, 70, sawD - 20, sx + sawW * 0.2, h + 35, z0 + sawD / 2, '#cfd3d6', { metalness: 0.4 });
    box(g, 10, 60, 180, sx - sawW * 0.1, h + 30, z0 + sawD / 2, '#c8202a');
    box(g, sawW, 60, 60, sx, h - 30, z0 + sawD + 30, '#cfd3d6', { metalness: 0.4 });     // fence rail
  } else {
    box(g, w, T, d, 0, h - T / 2, 0, ply);
  }
}

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

// Sofa raised on legs with slim square arms, tufted seat cushions and back cushions.
// With it.chaise ('left'/'right', as you face the sofa) one end becomes a chaise running forward
// to the full depth; the main seat is it.seatD deep and the chaise it.chaiseW wide (including
// the arm, which covers the back part of the chaise unless it.openChaise is set).
function leggedSofa(g, it) {
  const s = new THREE.Group();
  g.add(s);
  if (it.chaise === 'right') s.scale.x = -1;          // built with the chaise on the left (-x)
  const { w, d, h } = it, c = it.color || '#8d8a85';
  const legH = it.legs ?? 150, seat = it.seat ?? 450, armH = it.armH ?? 650;
  const armW = it.armW ?? 150, backD = 200, cushion = it.cushion ?? 150, base = seat - cushion;
  const chaise = it.chaise === 'left' || it.chaise === 'right';
  const mainD = chaise ? Math.min(it.seatD ?? 875, d) : d;
  const chW = chaise ? Math.min(it.chaiseW ?? 900, w - 600) : 0;
  const chaiseArm = chaise && !it.openChaise;
  const z0 = -d / 2, x0 = -w / 2;
  const light = shade(c, 1.1), seam = shade(c, 0.72);
  // a tufted cushion: lines both ways on top every ~120 mm
  const cushionAt = (cx, cw, zA, zB) => {
    const cd = zB - zA, cz = (zA + zB) / 2;
    box(s, cw - 12, cushion, cd - 10, cx, base + cushion / 2, cz, light);
    if (it.tufted === false) return;
    const nx = Math.max(2, Math.round(cw / 120)), nz = Math.max(2, Math.round(cd / 120));
    for (let i = 1; i < nx; i++) box(s, 6, 3, cd - 40, cx - cw / 2 + (cw / nx) * i, seat + 1, cz, seam);
    for (let j = 1; j < nz; j++) box(s, cw - 40, 3, 6, cx, seat + 1, zA + (cd / nz) * j, seam);
  };
  // frame
  box(s, w, base - legH, mainD, 0, (legH + base) / 2, z0 + mainD / 2, c);
  if (chaise) box(s, chW, base - legH, d - mainD, x0 + chW / 2, (legH + base) / 2, z0 + mainD + (d - mainD) / 2, c);
  // arms: far end always; chaise end over the back part of the chaise
  box(s, armW, armH - legH, mainD, w / 2 - armW / 2, (legH + armH) / 2, z0 + mainD / 2, c);
  if (!chaise) box(s, armW, armH - legH, d, x0 + armW / 2, (legH + armH) / 2, 0, c);
  else if (chaiseArm) box(s, armW, armH - base, mainD, x0 + armW / 2, (base + armH) / 2, z0 + mainD / 2, c);
  const inX0 = x0 + (chaise && !chaiseArm ? 0 : armW), inX1 = w / 2 - armW;
  // back frame
  box(s, inX1 - inX0, h - base - 40, backD, (inX0 + inX1) / 2, (base + h - 40) / 2, z0 + backD / 2, c);
  // seat cushions
  const seatZ0 = z0 + backD, seatZ1 = z0 + mainD;
  const runX0 = chaise ? x0 + chW : inX0;
  const n = it.seatCushions ?? 1, cw = (inX1 - runX0) / n;
  for (let i = 0; i < n; i++) cushionAt(runX0 + cw * (i + 0.5), cw, seatZ0, seatZ1);
  if (chaise) {
    cushionAt((inX0 + x0 + chW) / 2, x0 + chW - inX0, seatZ0, seatZ1);                 // beside the arm
    cushionAt(x0 + chW / 2, chW, seatZ1, d / 2 - 5);                                    // chaise front
  }
  // back cushions across the full inner width
  const nb = it.backCushions ?? Math.max(1, Math.round((inX1 - inX0) / 900)), bw = (inX1 - inX0) / nb;
  for (let i = 0; i < nb; i++) {
    const bc = box(s, bw - 16, h - seat - 20, 160, inX0 + bw * (i + 0.5), seat + (h - seat - 20) / 2, z0 + backD + 60, shade(c, 1.15));
    bc.rotation.x = -0.12;
  }
  // slim legs
  const li = 100, legs = [[x0 + li, z0 + 80], [w / 2 - li, z0 + 80], [w / 2 - li, z0 + mainD - 80]];
  if (chaise) legs.push([x0 + li, d / 2 - 80], [x0 + chW - li, d / 2 - 80]);
  else legs.push([x0 + li, d / 2 - 80]);
  const legC = it.legColor || '#2b2723', metal = it.legColor ? { metalness: 0.5, roughness: 0.3 } : undefined;
  for (const [lx, lz] of legs) box(s, 30, legH, 30, lx, legH / 2, lz, legC, metal);
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
    case 'shell-chair':
      shellChair(g, it);
      break;
    case 'swivel-chair':
      swivelChair(g, it);
      break;
    case 'swivel-stool':
      swivelStool(g, it);
      break;
    case 'lounge-chair':
      g.add(loungeChair(it));
      break;
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
    case 'bed':
      bed(g, it);
      break;
    case 'sliding-wardrobe':
      slidingWardrobe(g, it);
      break;
    case 'dressing-table':
      dressingTable(g, it);
      break;
    case 'desk':
      desk(g, it);
      break;
    case 'bath':
      bath(g, it);
      break;
    case 'shower-tray':
      showerTray(g, it);
      break;
    case 'toilet':
      toilet(g, it);
      break;
    case 'basin':
      basin(g, it);
      break;
    case 'vanity':
      vanity(g, it);
      break;
    case 'mid-sleeper':
      midSleeper(g, it);
      break;
    case 'cube-shelf':
      cubeShelf(g, it);
      break;
    case 'stepped-storage':
      steppedStorage(g, it);
      break;
    case 'framed-chest':
      framedChest(g, it);
      break;
    case 'glass-block':
      glassBlock(g, it);
      break;
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
    case 'stagger-shelf':
      staggerShelf(g, it);
      break;
    case 'trolley':
      trolley(g, it);
      break;
    case 'saw-bench':
      sawBench(g, it);
      break;
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
    case 'legged-sofa':
      leggedSofa(g, it);
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
