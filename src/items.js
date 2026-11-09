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
    case 'appliance':
      box(g, w, h, d, 0, h / 2, 0, c, { roughness: 0.4, metalness: 0.2 });
      box(g, w * 0.04, h * 0.3, 20, w * 0.4, h * 0.6, d / 2 + 10, '#888888', { metalness: 0.6 });
      break;
    default:
      box(g, w, h, d, 0, h / 2, 0, c);
  }
  return g;
}
