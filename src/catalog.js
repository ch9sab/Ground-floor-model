// Furniture and kitchen presets. Sizes in millimetres:
//   w = width (left-right), d = depth (front-back), h = height, z = height above floor.
// Edit or extend this list freely; `type` picks how the item is drawn (see items.js).
export const CATALOG = [
  // Corner sofa from the product page: 315 × 212 cm, 80 cm high, seat 48 cm, arm 65 cm, legs 18 cm.
  // Main-run depth (95 cm) and chaise width (110 cm) are estimated from the photos — check in store.
  { group: 'Living', label: 'Corner sofa 315×212 (chaise left)', item: { type: 'sectional', name: 'Corner sofa', w: 3150, d: 2120, h: 800, color: '#5d6878', chaise: 'left', chaiseW: 1100, seatD: 950, sideBack: 1100, seat: 480, armH: 650, legs: 180 } },
  { group: 'Living', label: 'Corner sofa 315×212 (chaise right)', item: { type: 'sectional', name: 'Corner sofa', w: 3150, d: 2120, h: 800, color: '#5d6878', chaise: 'right', chaiseW: 1100, seatD: 950, sideBack: 1100, seat: 480, armH: 650, legs: 180 } },
  // BoConcept Osaka 2.5-seater, tufted seat (433AC29): 206 W x 87.5 D x 77 H cm, seat 45, arms 65, legs 15.
  { group: 'Living', label: 'BoConcept Osaka 2½-seater', item: { type: 'legged-sofa', name: 'Osaka sofa', w: 2060, d: 875, h: 770, seat: 450, armH: 650, armW: 120, legs: 150, cushion: 170, color: '#8d8a85', legColor: '#b9bcc0' } },
  // BoConcept Osaka chaise longue sofa (433AF29, chaise on the right): 242 W x 141.5 D x 77 H cm, seat 45,
  // arms 65, legs 15. From the front view: arms ~12 cm, two ~70 cm tufted seats, chaise ~90 cm wide with an arm
  // over its back part; main seat depth 87.5 as the 2.5-seater. Dark green fabric, aluminium legs.
  { group: 'Living', label: 'BoConcept Osaka chaise sofa (right)', item: { type: 'legged-sofa', name: 'Osaka chaise sofa', w: 2420, d: 1415, h: 770, seat: 450, armH: 650, armW: 120, legs: 150, cushion: 170, chaise: 'right', chaiseW: 900, seatD: 875, seatCushions: 2, backCushions: 3, color: '#34403a', legColor: '#b9bcc0' } },
  // Oak-framed lounge armchair with tan leather cushions (own chair): 61 W x 101 D x 86 H cm, seat 44 cm.
  { group: 'Living', label: 'Oak & leather armchair', item: { type: 'lounge-chair', name: 'Armchair', w: 610, d: 1010, h: 860, seat: 440, color: '#8a4a32', frame: '#d6a35f' } },
  // Tan leather swivel lounge chair (own chair): 93 W x 91 D x 89 H cm, back reclined about 25°.
  // Seat height (42 cm) and the footstool's height are estimates; the footstool is 90 cm square.
  { group: 'Living', label: 'Leather swivel armchair', item: { type: 'swivel-chair', name: 'Swivel armchair', w: 930, d: 910, h: 890, seat: 420, recline: 25, color: '#a8653a' } },
  { group: 'Living', label: 'Leather swivel footstool 90×90', item: { type: 'swivel-stool', name: 'Footstool', w: 900, d: 900, h: 420, color: '#a8653a' } },
  // IKEA Vedbo armchair, Gunnared blue: 73 W x 65 D x 75 H cm, seat 48 W x 45 D, 22 cm clear underneath.
  // Seat height 40 cm is an estimate. Birch legs.
  { group: 'Living', label: 'IKEA Vedbo armchair', item: { type: 'shell-chair', name: 'Vedbo armchair', w: 730, d: 650, h: 750, seat: 400, color: '#3f5a73', cushion: '#4b6c8a', frame: '#e3c99a' } },
  // IKEA BESTÅ storage combination with drawers, 180x42x75 cm: black-brown frame, Krukmakare dark grey-green
  // fronts (door | 2 drawers | door, no handles), walnut-effect top, legs.
  { group: 'Living', label: 'IKEA BESTÅ 180×42×75 (drawers)', item: { type: 'cabinet', name: 'BESTÅ storage', w: 1800, d: 420, h: 750, legs: 100, topT: 16, topFront: 0, fronts: '1d|1w/1w|1d', handle: 'none', shaker: true, color: '#5f7a6c', carcass: '#2c2724', worktop: '#7a5a3e', legColor: '#1f1d1b' } },
  // Oak-effect bookcase with red back, 4 shelves over 2 drawers, black hairpin legs: 85 W x 30 D x 180 H cm.
  { group: 'Living', label: 'Bookcase with drawers 85×30×180', item: { type: 'cabinet', name: 'Bookcase', w: 850, d: 300, h: 1800, legs: 200, fronts: '1o/1o/1o/1o/220:2w', color: '#d8ad72', carcass: '#d8ad72', back: '#d8432a', legColor: '#1b1b1b' } },
  // Plywood bookshelf with staggered shelves, offset dividers, drawers and tapered legs: 180 W x 37 D x 121 H cm.
  { group: 'Living', label: 'Plywood bookshelf 180×37×121', item: { type: 'stagger-shelf', name: 'Plywood bookshelf', w: 1800, d: 370, h: 1210, color: '#e4d0a8' } },
  // IKEA trolley (black steel, two shelves) with a birch plywood tray on top. Size assumed from IKEA BROR: 85 x 55 x 88 cm.
  { group: 'Other', label: 'IKEA trolley with plywood tray', item: { type: 'trolley', name: 'Trolley', w: 850, d: 550, h: 880, color: '#1e1e20', tray: '#d9a868' } },
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
  { group: 'Other', label: 'Radiator', item: { type: 'box', name: 'Radiator', w: 1000, d: 100, h: 600, z: 150, color: '#f0f0f0' } },
  { group: 'Other', label: 'Box', item: { type: 'box', name: 'Box', w: 600, d: 600, h: 600, color: '#9aa5b1' } },
];

// ---- Home gym ----
CATALOG.push(
  // Lionscool leg extension / curl machine: 57.1" x 43.7" footprint, 38.6" high.
  { group: 'Gym', label: 'Leg extension / curl machine', item: { type: 'leg-machine', name: 'Leg extension machine', w: 1110, d: 1450, h: 980, color: '#c4262e' } },
  // WalkingPad Z3 Hybrid+: 1472 L x 765 W x 1030 H with the handlebar up.
  { group: 'Gym', label: 'WalkingPad Z3 treadmill', item: { type: 'walking-pad', name: 'WalkingPad Z3', w: 765, d: 1472, h: 1030, handlebar: 'up', color: '#2a2b2e' } },
  // Freak Athlete Hyper Pro X: in-use size estimated from the original Hyper Pro (65" x 30"); stores upright at 23" x 58" high.
  { group: 'Gym', label: 'Freak Athlete Hyper Pro X', item: { type: 'hyper-bench', name: 'Hyper Pro X', w: 760, d: 1650, h: 950, color: '#1d1d1f' } },
  // REP Fitness Ares 2.0 wall-mounted cable rack with storage wings: 2391 W (2685 with plates), 2085 high,
  // 737 from the wall to the frame front, 1113 to the pull-up bar extension. Back of the item goes against the wall.
  // Mobile workbench with built-in table saw: a full 8x4 ft sheet top (2440 x 1220), ~900 high on casters.
  { group: 'Garage', label: 'Workbench 8×4 with table saw', item: { type: 'saw-bench', name: 'Workbench with table saw', w: 2440, d: 1220, h: 900, saw: 'right', color: '#e3cb9f' } },
  // Units already in the garage (from photos): white gloss kitchen wall units, an IKEA PAX combination
  // (door over 4 drawers | open shelves | door over 4 drawers) and a pine Trofast-style unit with coloured bins.
  { group: 'Garage', label: 'White wall unit, 2-door 1200', item: { type: 'cabinet', name: 'White wall unit', w: 1200, d: 330, h: 900, z: 1150, fronts: '2d', color: '#f4f4f2', carcass: '#f4f4f2', handle: 'bottom' } },
  { group: 'Garage', label: 'White wall unit, 1-door 600', item: { type: 'cabinet', name: 'White wall unit', w: 600, d: 330, h: 900, z: 1150, fronts: '1d', color: '#f4f4f2', carcass: '#f4f4f2', handle: 'bottom' } },
  { group: 'Garage', label: 'IKEA PAX wardrobe 150 (doors, drawers, shelves)', item: { type: 'cabinet', name: 'PAX wardrobe', w: 1500, d: 580, h: 2010, fronts: '1d/180:1w/180:1w/180:1w/180:1w|1o/1o/1o/1o/1o/1o|1d/180:1w/180:1w/180:1w/180:1w', color: '#d49a55', carcass: '#d49a55' } },
  { group: 'Garage', label: 'Trofast-style box unit (coloured bins)', item: { type: 'stepped-storage', name: 'Box storage unit', w: 980, d: 440, h: 1500, heights: '1500/1500/800', boxW: 280, boxD: 420, boxH: 230, color: '#c99a5e', boxColors: '#f1f1ee,#f2c400,#f0b8c8,#e8792e,#f2c400,#f1f1ee,#e8792e' } },
  { group: 'Gym', label: 'REP Ares 2.0 cable rack', item: { type: 'cable-rack', name: 'REP Ares 2.0', w: 2391, d: 1113, h: 2085, frameD: 737, coreW: 1404, color: '#1b1b1d' } },
  { group: 'Gym', label: 'Hyper Pro X (stored upright)', item: { type: 'box', name: 'Hyper Pro X (stored)', w: 760, d: 585, h: 1470, color: '#1d1d1f' } },
);

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

// ---- Bedroom (UK sizes) ----
// Beds: w/d is the whole frame (mattress + 30 mm each side, 60 mm headboard + 30 mm foot rail);
// mattressW/mattressD are the UK mattress sizes. h is the top of the mattress.
const bed = (label, mW, mD) => ({ group: 'Bedroom', label, item: {
  type: 'bed', name: label.replace(/ \d.*/, ''), w: mW + 60, d: mD + 90, h: 550, mattressW: mW, mattressD: mD, headboard: 1050, color: '#b9a48a' } });
// Wardrobes, drawers and bedsides use the 'cabinet' fronts layout (see items.js): d = door, w = drawer.
const WOOD = '#e4d8c4', WHITE = '#efede8';
const unit = (label, w, d, h, fronts, extra = {}) => ({ group: 'Bedroom', label, item: {
  type: 'cabinet', name: label.replace(/ \d.*/, ''), w, d, h, plinth: 50, fronts, color: WOOD, carcass: WOOD, ...extra } });
CATALOG.push(
  bed('Single bed 90×190', 900, 1900),
  bed('Small double bed 120×190', 1200, 1900),
  bed('Double bed 135×190', 1350, 1900),
  bed('King bed 150×200', 1500, 2000),
  bed('Super king bed 180×200', 1800, 2000),
  // Mid-sleeper cabin bed with pull-out desk: 198 cm long, 105 cm deep with the desk in (183–192 cm
  // with it pulled out), 109 cm high; 90 x 190 mattress up to 15–16 cm deep. Grey painted pine.
  { group: 'Bedroom', label: 'Mid-sleeper with pull-out desk', item: { type: 'mid-sleeper', name: 'Mid-sleeper bed', w: 1980, d: 1050, h: 1090,
    closedD: 1050, openD: 1880, extension: 'closed', deck: 780, mattressH: 150, deskD: 900, color: '#8e9196' } },
  // IKEA Kallax shelf 2x4: 76.5 W x 39 D x 146.5 H cm, cubes 33.5 x 33.5 cm. White-stained oak effect.
  { group: 'Bedroom', label: 'IKEA Kallax shelf 2×4', item: { type: 'cube-shelf', name: 'Kallax shelf', w: 765, d: 390, h: 1465, cols: 2, rows: 4, cell: 335, color: '#dcc8aa' } },
  // IKEA Trofast stepped storage: 99 W x 44 D x 94 H cm (columns 94 / 68 / 43 high), boxes 42 x 30 x 23 cm.
  { group: 'Bedroom', label: 'IKEA Trofast stepped storage', item: { type: 'stepped-storage', name: 'Trofast storage', w: 990, d: 440, h: 940, heights: '940/680/430', boxW: 300, boxD: 420, boxH: 230, color: '#f2f2f0', boxColor: '#fbfbf9' } },
  // IKEA Hemnes chest of 3 drawers, grey-green with a light brown pine top. 108 W x 50 D x 96 H cm is
  // IKEA's usual size for this chest (not given with the photo): check before buying.
  { group: 'Bedroom', label: 'IKEA Hemnes chest, 3 drawers', item: { type: 'framed-chest', name: 'Hemnes chest', w: 1080, d: 500, h: 960, drawers: 3, color: '#9fb5a5', top: '#c9a26b' } },
  unit('Bedside table 450 (2 drawers)', 450, 400, 550, '1w/1w'),
  unit('Bedside table 400 (drawer + shelf)', 400, 350, 500, '150:1w/1o'),
  unit('Single wardrobe 500', 500, 600, 2000, '150:1w/1d'),
  unit('Double wardrobe 1000', 1000, 600, 2000, '2d'),
  { group: 'Bedroom', label: 'Sliding-door wardrobe 1800', item: { type: 'sliding-wardrobe', name: 'Sliding wardrobe', w: 1800, d: 650, h: 2200, doors: 2, color: WHITE } },
  { group: 'Bedroom', label: 'Sliding-door wardrobe 2400 (mirror)', item: { type: 'sliding-wardrobe', name: 'Sliding wardrobe', w: 2400, d: 650, h: 2200, doors: 3, mirror: true, color: WHITE } },
  unit('Chest of drawers 800 (2 over 3)', 800, 450, 900, '2w/1w/1w/1w'),
  { group: 'Bedroom', label: 'Dressing table 1200 + mirror', item: { type: 'dressing-table', name: 'Dressing table', w: 1200, d: 450, h: 760, color: WOOD } },
  { group: 'Bedroom', label: 'Dressing table 1000 + round mirror', item: { type: 'dressing-table', name: 'Dressing table', w: 1000, d: 400, h: 760, mirror: 'round', drawers: 1, color: '#e8d9b8' } },
  { group: 'Bedroom', label: 'Full-length mirror', item: { type: 'box', name: 'Mirror', w: 500, d: 30, h: 1500, z: 300, color: '#c7d2d8' } },
  { group: 'Bedroom', label: 'Desk 1200', item: { type: 'desk', name: 'Desk', w: 1200, d: 600, h: 740, pedestal: 'none', color: WOOD } },
  { group: 'Bedroom', label: 'Desk 1400 with drawers', item: { type: 'desk', name: 'Desk', w: 1400, d: 700, h: 740, pedestal: 'right', color: WOOD } },
);

// ---- Bathroom (UK sizes) ----
// The back of each fitting goes against the wall (-z); taps and cisterns are drawn there.
CATALOG.push(
  { group: 'Bathroom', label: 'Bath 1700×700', item: { type: 'bath', name: 'Bath', w: 1700, d: 700, h: 550, taps: 'left', color: '#f6f6f3' } },
  { group: 'Bathroom', label: 'Shower bath 1700×800 + screen', item: { type: 'bath', name: 'Shower bath', w: 1700, d: 800, h: 550, taps: 'left', screen: true, color: '#f6f6f3' } },
  { group: 'Bathroom', label: 'Shower tray 900×900', item: { type: 'shower-tray', name: 'Shower tray', w: 900, d: 900, h: 40, screen: 'none', color: '#f6f6f3' } },
  { group: 'Bathroom', label: 'Shower tray 1200×800 + enclosure', item: { type: 'shower-tray', name: 'Shower enclosure', w: 1200, d: 800, h: 40, screen: 'enclosure', color: '#f6f6f3' } },
  { group: 'Bathroom', label: 'Toilet (close-coupled)', item: { type: 'toilet', name: 'Toilet', w: 370, d: 650, h: 800, color: '#f6f6f3' } },
  { group: 'Bathroom', label: 'Basin on pedestal 550', item: { type: 'basin', name: 'Basin', w: 550, d: 450, h: 850, color: '#f6f6f3' } },
  { group: 'Bathroom', label: 'Vanity unit 600 (2 doors)', item: { type: 'vanity', name: 'Vanity unit', w: 600, d: 450, h: 850, fronts: '2d', color: '#5f7a76' } },
  { group: 'Bathroom', label: 'Vanity unit 800 (2 drawers)', item: { type: 'vanity', name: 'Vanity unit', w: 800, d: 460, h: 850, fronts: '1w/1w', color: '#5f7a76' } },
  { group: 'Bathroom', label: 'Toilet (wall-hung, boxed in)', item: { type: 'toilet', name: 'Toilet', style: 'wall-hung', w: 360, d: 740, h: 1000, color: '#f6f6f3' } },
  { group: 'Bathroom', label: 'Vanity run 1800 (basin off-centre)', item: { type: 'vanity', name: 'Vanity unit', w: 1800, d: 400, h: 850, fronts: '150:3w/3d', basinAt: 400, color: '#f2f2f0', carcass: '#f2f2f0' } },
  { group: 'Bathroom', label: 'Mirror cabinet 1000', item: { type: 'cabinet', name: 'Mirror cabinet', w: 1000, d: 150, h: 700, z: 1250, fronts: '2d', handle: 'bottom', color: '#c7d2d8', carcass: '#e8e8e6' } },
  { group: 'Bathroom', label: 'Glass-block wall 1000', item: { type: 'glass-block', name: 'Glass-block wall', w: 1000, d: 80, h: 2100 } },
  { group: 'Bathroom', label: 'Heated towel rail 500', item: { type: 'box', name: 'Towel rail', w: 500, d: 80, h: 1200, z: 150, color: '#c9ced3' } },
);

export const ITEM_TYPES = ['box', 'sofa', 'table', 'chair', 'bed', 'rug', 'base-unit', 'sink-unit', 'hob-unit', 'wall-unit', 'tall-unit', 'appliance', 'stairs', 'sectional', 'longview-chair', 'trestle-table', 'french-door-fridge', 'cabinet', 'leg-machine', 'walking-pad', 'hyper-bench', 'cable-rack', 'legged-sofa', 'sliding-wardrobe', 'dressing-table', 'desk', 'bath', 'shower-tray', 'toilet', 'basin', 'vanity', 'glass-block', 'mid-sleeper', 'cube-shelf', 'stepped-storage', 'framed-chest', 'lounge-chair', 'swivel-chair', 'swivel-stool', 'shell-chair', 'saw-bench', 'stagger-shelf', 'trolley'];
