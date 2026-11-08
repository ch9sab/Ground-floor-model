// Furniture and kitchen presets. Sizes in millimetres:
//   w = width (left-right), d = depth (front-back), h = height, z = height above floor.
// Edit or extend this list freely; `type` picks how the item is drawn (see items.js).
export const CATALOG = [
  { group: 'Living', label: 'Sofa (3 seat)', item: { type: 'sofa', name: 'Sofa', w: 2200, d: 900, h: 850, color: '#6b7c93' } },
  { group: 'Living', label: 'Sofa (2 seat)', item: { type: 'sofa', name: 'Sofa', w: 1700, d: 900, h: 850, color: '#6b7c93' } },
  { group: 'Living', label: 'Armchair', item: { type: 'sofa', name: 'Armchair', w: 900, d: 850, h: 850, color: '#8a6f5a' } },
  { group: 'Living', label: 'Coffee table', item: { type: 'table', name: 'Coffee table', w: 1200, d: 600, h: 400, color: '#a0785a' } },
  { group: 'Living', label: 'TV unit', item: { type: 'box', name: 'TV unit', w: 1600, d: 400, h: 500, color: '#4a4a4a' } },
  { group: 'Living', label: 'Bookcase', item: { type: 'box', name: 'Bookcase', w: 800, d: 300, h: 1800, color: '#c9b79c' } },
  { group: 'Living', label: 'Rug', item: { type: 'rug', name: 'Rug', w: 2000, d: 1400, h: 10, color: '#b9a48a' } },

  { group: 'Dining', label: 'Dining table 6', item: { type: 'table', name: 'Dining table', w: 1800, d: 900, h: 750, color: '#a0785a' } },
  { group: 'Dining', label: 'Dining table 4', item: { type: 'table', name: 'Dining table', w: 1200, d: 800, h: 750, color: '#a0785a' } },
  { group: 'Dining', label: 'Chair', item: { type: 'chair', name: 'Chair', w: 450, d: 500, h: 900, color: '#5b4636' } },

  { group: 'Kitchen', label: 'Base unit 600', item: { type: 'base-unit', name: 'Base unit', w: 600, d: 600, h: 900, color: '#2f4f4f', worktop: '#d8d2c4' } },
  { group: 'Kitchen', label: 'Base unit 300', item: { type: 'base-unit', name: 'Base unit', w: 300, d: 600, h: 900, color: '#2f4f4f', worktop: '#d8d2c4' } },
  { group: 'Kitchen', label: 'Base unit 1000', item: { type: 'base-unit', name: 'Base unit', w: 1000, d: 600, h: 900, color: '#2f4f4f', worktop: '#d8d2c4' } },
  { group: 'Kitchen', label: 'Sink unit', item: { type: 'sink-unit', name: 'Sink unit', w: 800, d: 600, h: 900, color: '#2f4f4f', worktop: '#d8d2c4' } },
  { group: 'Kitchen', label: 'Hob unit', item: { type: 'hob-unit', name: 'Hob unit', w: 600, d: 600, h: 900, color: '#2f4f4f', worktop: '#d8d2c4' } },
  { group: 'Kitchen', label: 'Wall unit 600', item: { type: 'wall-unit', name: 'Wall unit', w: 600, d: 350, h: 720, z: 1450, color: '#2f4f4f' } },
  { group: 'Kitchen', label: 'Tall unit', item: { type: 'tall-unit', name: 'Tall unit', w: 600, d: 600, h: 2200, color: '#2f4f4f' } },
  { group: 'Kitchen', label: 'Fridge freezer', item: { type: 'appliance', name: 'Fridge freezer', w: 600, d: 650, h: 1850, color: '#d0d4d8' } },
  { group: 'Kitchen', label: 'Range cooker', item: { type: 'appliance', name: 'Range cooker', w: 1000, d: 600, h: 900, color: '#3a3a3a' } },
  { group: 'Kitchen', label: 'Island', item: { type: 'base-unit', name: 'Island', w: 2000, d: 900, h: 900, color: '#2f4f4f', worktop: '#d8d2c4' } },
  { group: 'Kitchen', label: 'Bar stool', item: { type: 'chair', name: 'Bar stool', w: 400, d: 400, h: 950, color: '#3a3a3a', seat: 650 } },

  { group: 'Other', label: 'Desk', item: { type: 'table', name: 'Desk', w: 1400, d: 700, h: 750, color: '#c9b79c' } },
  { group: 'Other', label: 'Double bed', item: { type: 'bed', name: 'Bed', w: 1400, d: 2000, h: 550, color: '#e6e1d8' } },
  { group: 'Other', label: 'Radiator', item: { type: 'box', name: 'Radiator', w: 1000, d: 100, h: 600, z: 150, color: '#f0f0f0' } },
  { group: 'Other', label: 'Box', item: { type: 'box', name: 'Box', w: 600, d: 600, h: 600, color: '#9aa5b1' } },
];

export const ITEM_TYPES = ['box', 'sofa', 'table', 'chair', 'bed', 'rug', 'base-unit', 'sink-unit', 'hob-unit', 'wall-unit', 'tall-unit', 'appliance'];
