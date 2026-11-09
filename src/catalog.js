// Furniture and kitchen presets. Sizes in millimetres:
//   w = width (left-right), d = depth (front-back), h = height, z = height above floor.
// Edit or extend this list freely; `type` picks how the item is drawn (see items.js).
export const CATALOG = [
  // Corner sofa from the product page: 315 × 212 cm, 80 cm high, seat 48 cm, arm 65 cm, legs 18 cm.
  // Main-run depth (95 cm) and chaise width (110 cm) are estimated from the photos — check in store.
  { group: 'Living', label: 'Corner sofa 315×212 (chaise left)', item: { type: 'sectional', name: 'Corner sofa', w: 3150, d: 2120, h: 800, color: '#5d6878', chaise: 'left', chaiseW: 1100, seatD: 950, sideBack: 1100, seat: 480, armH: 650, legs: 180 } },
  { group: 'Living', label: 'Corner sofa 315×212 (chaise right)', item: { type: 'sectional', name: 'Corner sofa', w: 3150, d: 2120, h: 800, color: '#5d6878', chaise: 'right', chaiseW: 1100, seatD: 950, sideBack: 1100, seat: 480, armH: 650, legs: 180 } },
  { group: 'Living', label: 'Sofa (3 seat)', item: { type: 'sofa', name: 'Sofa', w: 2200, d: 900, h: 850, color: '#6b7c93' } },
  { group: 'Living', label: 'Sofa (2 seat)', item: { type: 'sofa', name: 'Sofa', w: 1700, d: 900, h: 850, color: '#6b7c93' } },
  { group: 'Living', label: 'Armchair', item: { type: 'sofa', name: 'Armchair', w: 900, d: 850, h: 850, color: '#8a6f5a' } },
  { group: 'Living', label: 'Coffee table', item: { type: 'table', name: 'Coffee table', w: 1200, d: 600, h: 400, color: '#a0785a' } },
  { group: 'Living', label: 'TV unit', item: { type: 'box', name: 'TV unit', w: 1600, d: 400, h: 500, color: '#4a4a4a' } },
  { group: 'Living', label: 'Bookcase', item: { type: 'box', name: 'Bookcase', w: 800, d: 300, h: 1800, color: '#c9b79c' } },
  { group: 'Living', label: 'Rug', item: { type: 'rug', name: 'Rug', w: 2000, d: 1400, h: 10, color: '#b9a48a' } },

  { group: 'Dining', label: 'Dining table 6', item: { type: 'table', name: 'Dining table', w: 1800, d: 900, h: 750, color: '#a0785a' } },
  { group: 'Dining', label: 'Dining table 4', item: { type: 'table', name: 'Dining table', w: 1200, d: 800, h: 750, color: '#a0785a' } },
  // Extendable dining table: 160 cm closed / 220 cm extended, 90 deep, 75 high, legs 127 cm apart.
  { group: 'Dining', label: 'Extendable table 160–220', item: { type: 'trestle-table', name: 'Dining table', w: 1600, d: 900, h: 750, closedW: 1600, openW: 2200, extension: 'closed', legSpan: 1270, color: '#d9b88f' } },
  // Longview dining chair (Foureyes, 2020): 508 W x 673 D x 749 H, seat 470 high, 419 deep.
  { group: 'Dining', label: 'Longview dining chair', item: { type: 'longview-chair', name: 'Longview chair', w: 508, d: 673, h: 749, color: '#dcc29a' } },
  { group: 'Dining', label: 'Chair', item: { type: 'chair', name: 'Chair', w: 450, d: 500, h: 900, color: '#5b4636' } },

  { group: 'Kitchen', label: 'Base unit 600', item: { type: 'base-unit', name: 'Base unit', w: 600, d: 600, h: 900, color: '#2f4f4f', worktop: '#d8d2c4' } },
  { group: 'Kitchen', label: 'Base unit 300', item: { type: 'base-unit', name: 'Base unit', w: 300, d: 600, h: 900, color: '#2f4f4f', worktop: '#d8d2c4' } },
  { group: 'Kitchen', label: 'Base unit 1000', item: { type: 'base-unit', name: 'Base unit', w: 1000, d: 600, h: 900, color: '#2f4f4f', worktop: '#d8d2c4' } },
  { group: 'Kitchen', label: 'Sink unit', item: { type: 'sink-unit', name: 'Sink unit', w: 800, d: 600, h: 900, color: '#2f4f4f', worktop: '#d8d2c4' } },
  { group: 'Kitchen', label: 'Hob unit', item: { type: 'hob-unit', name: 'Hob unit', w: 600, d: 600, h: 900, color: '#2f4f4f', worktop: '#d8d2c4' } },
  { group: 'Kitchen', label: 'Wall unit 600', item: { type: 'wall-unit', name: 'Wall unit', w: 600, d: 350, h: 720, z: 1450, color: '#2f4f4f' } },
  { group: 'Kitchen', label: 'Tall unit', item: { type: 'tall-unit', name: 'Tall unit', w: 600, d: 600, h: 2200, color: '#2f4f4f' } },
  // Fisher & Paykel RF540ANUB6 569L French door fridge freezer (ice & water): 900 W x 695 D x 1790 H.
  { group: 'Kitchen', label: 'American fridge freezer 900', item: { type: 'french-door-fridge', name: 'American fridge freezer', w: 900, d: 695, h: 1790, color: '#74777c' } },
  { group: 'Kitchen', label: 'Fridge freezer', item: { type: 'appliance', name: 'Fridge freezer', w: 600, d: 650, h: 1850, color: '#d0d4d8' } },
  { group: 'Kitchen', label: 'Range cooker', item: { type: 'appliance', name: 'Range cooker', w: 1000, d: 600, h: 900, color: '#3a3a3a' } },
  { group: 'Kitchen', label: 'Island', item: { type: 'base-unit', name: 'Island', w: 2000, d: 900, h: 900, color: '#2f4f4f', worktop: '#d8d2c4' } },
  { group: 'Kitchen', label: 'Bar stool', item: { type: 'chair', name: 'Bar stool', w: 400, d: 400, h: 950, color: '#3a3a3a', seat: 650 } },

  { group: 'Other', label: 'Desk', item: { type: 'table', name: 'Desk', w: 1400, d: 700, h: 750, color: '#c9b79c' } },
  { group: 'Other', label: 'Double bed', item: { type: 'bed', name: 'Bed', w: 1400, d: 2000, h: 550, color: '#e6e1d8' } },
  { group: 'Other', label: 'Radiator', item: { type: 'box', name: 'Radiator', w: 1000, d: 100, h: 600, z: 150, color: '#f0f0f0' } },
  { group: 'Other', label: 'Box', item: { type: 'box', name: 'Box', w: 600, d: 600, h: 600, color: '#9aa5b1' } },
];

// ---- Plyko kitchen design (birch ply with terracotta Formica fronts) ----
// Sizes from the elevation drawings: base units 150 plinth + 720 carcass + 30 worktop = 900 high,
// 600 deep; tall units 2300 high. fronts: rows top→bottom, e.g. "150:1w/1w/1w" (see items.js).
const TERRA = '#b5654c', PLYW = '#dcc39b', TOP = '#e6e2da';
const base = (label, w, fronts, extra = {}) => ({ group: 'Plyko kitchen', label, item: {
  type: 'cabinet', name: label, w, d: 600, h: 900, plinth: 150, topT: 30, fronts, color: PLYW, carcass: PLYW, worktop: TOP, ...extra } });
CATALOG.push(
  base('Large double sink unit 1000', 1000, '140:1w/2d', { sink: 'double' }),
  base('Integrated dishwasher 636', 636, '1d'),
  base('Pull-out bins 600', 600, '1w'),
  base('Base unit 1 door 600', 600, '1d'),
  base('2-drawer unit 850', 850, '1w/1w'),
  base('Open basket unit 620', 620, '1b/1b/1b'),
  base('Open shelf end unit 600', 600, '1o/1o'),
  base('3-drawer unit 900 (terracotta)', 900, '150:1w/1w/1w', { color: TERRA }),
  base('3-drawer unit 900 with hob', 900, '150:1w/1w/1w', { color: TERRA, hob: true }),
  base('Island 2-door 800 (terracotta)', 800, '2d', { color: TERRA }),
  base('Island open cubbies 1100', 1100, '3o/2o'),
  { group: 'Plyko kitchen', label: 'Fridge housing 960 (924 gap)', item: { type: 'cabinet', name: 'Fridge housing', w: 960, d: 650, h: 2300, fronts: '450:2d/1x', color: TERRA, carcass: PLYW } },
  { group: 'Plyko kitchen', label: 'Oven tower 636 (2 ovens)', item: { type: 'cabinet', name: 'Oven tower', w: 636, d: 600, h: 2300, plinth: 150, fronts: '450:1d/455:1m/595:1v/1d', color: TERRA, carcass: PLYW } },
  { group: 'Plyko kitchen', label: 'Open shelf column 600×150', item: { type: 'cabinet', name: 'Shelf column', w: 600, d: 150, h: 2300, plinth: 150, fronts: '1o/1o/1o/1o/1o/1o/1o/1o/1o', carcass: PLYW } },
  { group: 'Plyko kitchen', label: 'Dresser top unit 650', item: { type: 'cabinet', name: 'Dresser top unit', w: 650, d: 400, h: 1500, z: 900, fronts: '700:2d/1o/1o/1o', handle: 'bottom', color: TERRA, carcass: PLYW } },
  { group: 'Plyko kitchen', label: 'Wall unit 2-door 650', item: { type: 'cabinet', name: 'Wall unit', w: 650, d: 350, h: 700, z: 1450, fronts: '2d', handle: 'bottom', color: TERRA, carcass: PLYW } },
  { group: 'Plyko kitchen', label: 'Tall 2-door cupboard 1000', item: { type: 'cabinet', name: 'Tall cupboard', w: 1000, d: 600, h: 2150, fronts: '2d', color: TERRA, carcass: PLYW } },
  { group: 'Plyko kitchen', label: 'End panel 18', item: { type: 'box', name: 'End panel', w: 18, d: 620, h: 900, color: PLYW } },
  { group: 'Plyko kitchen', label: 'Worktop piece 1000', item: { type: 'box', name: 'Worktop', w: 1000, d: 620, h: 30, z: 870, color: TOP } },
  { group: 'Plyko kitchen', label: 'Splashback 1000', item: { type: 'box', name: 'Splashback', w: 1000, d: 15, h: 450, z: 900, color: '#cfccc6' } },
  { group: 'Plyko kitchen', label: 'Floating shelf 900', item: { type: 'box', name: 'Floating shelf', w: 900, d: 250, h: 25, z: 1500, color: PLYW } },
);

export const ITEM_TYPES = ['box', 'sofa', 'table', 'chair', 'bed', 'rug', 'base-unit', 'sink-unit', 'hob-unit', 'wall-unit', 'tall-unit', 'appliance', 'stairs', 'sectional', 'longview-chair', 'trestle-table', 'french-door-fridge', 'cabinet'];
