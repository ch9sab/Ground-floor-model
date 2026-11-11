# Ground-floor-model

An editable 3D model of the ground floor, made for trying out furniture layouts,
kitchen designs and door positions. It runs in a web browser. The whole house is
described in one file, [`plan.json`](plan.json), with every size in millimetres.

`plan.json` has been **traced from the estate agent's floor plan** at about 15 mm per
drawing pixel. Room sizes come within ~60 mm of the stated dimensions (kitchen 3.93 ×
9.42 m vs 3.90 × 9.36 m stated). It includes the angled annexe, the sun room, the bay,
the garage and stores, every door and window, the stairs, the chimney breast and the
existing kitchen and utility units. Estate-agent drawings aren't survey-accurate, so
**check with a tape measure before ordering anything** (see Step 1). These are guesses
and need confirming:

- wall thicknesses (220 mm main house, 200 mm annexe, 100 mm internal)
- window sill heights and the bay window shape
- which way each door swings and where it's hinged (read off the drawing)
- the garage door, drawn as a plain opening

To correct a value, select the wall, door or window in the app and type in your
measurement, then **Export** and commit the file. Each room has a floor outline
(`poly`) and floor colour (`floor`) in `plan.json`.

---

## Step 1 — Measure the house

**Tools:** a laser measure (much easier than a tape for room lengths), a tape measure
for small items, and paper on a clipboard.

1. **Draw a rough sketch** of the ground floor. It doesn't need to be to scale. Number
   every wall and every door/window on it.
2. **Measure each room's inside dimensions** (wall to wall), at about waist height,
   above the skirting boards.
3. **Measure wall thicknesses.** At each doorway or window reveal you can measure
   straight through the wall. External walls are typically 250–350 mm and internal stud
   walls about 100–125 mm.
4. **Check that rooms are square.** Measure both diagonals of each room. If they differ
   by more than about 20 mm, note it, because a perfectly square kitchen won't fit
   exactly.
5. **For every door and window, record:**
   - which wall it is in, and the distance from a room corner to the edge of the opening
   - opening width and height (for windows, also the sill height from the floor)
   - which side the hinges are on and which way the door swings
6. **Ceiling height** (usually 2300–2500 mm).
7. **For the kitchen, also note** radiators, boiler, soil stack, gas meter, sockets and
   the water inlet. You can model these as `box` items so you don't design over them.

> Tip: also measure the overall outside length of the house. The room widths plus the
> wall thicknesses should add up to it, which is a good way to catch mistakes.

## Step 2 — Turn the measurements into `plan.json`

### Coordinates

- **Origin (0, 0)** is the outside **front-left corner** of the house (as seen from the street).
- **x** runs along the front of the house, left → right.
- **y** runs from the front towards the back.

### Walls

Walls are drawn along their **centre line**, from point `a` to point `b`:

```json
{ "id": "W1", "name": "Front wall", "a": [0, 0], "b": [9000, 0], "thickness": 300, "height": 2400 }
```

To get centre-line coordinates from inside measurements, add half the wall
thicknesses. Example: a 300 mm external wall followed by a 4200 mm wide room and then a
100 mm internal wall. The internal wall's centre line is at
`150 + 4200 + 50 = 4400` (half the external wall, plus the room, plus half the internal
wall).

Walls that meet at a corner or a T-junction should share **exactly** the same end point.
That lets the editor stretch connected walls when you drag one.

### Doors, windows and openings

```json
{ "id": "O4", "type": "door", "wall": "W6", "offset": 3300, "width": 826, "height": 2040,
  "hinge": "end", "side": 1, "openAngle": 80 }
{ "id": "O2", "type": "window", "wall": "W1", "offset": 1250, "width": 2000, "height": 1200, "sill": 900 }
```

- `offset` is measured along the wall's centre line from its `a` end to the edge of the
  opening.
- `type` is `door`, `window` (glazed; use `sill: 0` for patio or French doors) or
  `opening` (an archway with no door).
- `hinge` (`start`/`end`) and `side` (`1`/`-1`) set the swing. You don't need to work
  these out by hand: set them in the app with **Flip swing** and the Hinge drop-down.

### Rooms

```json
{ "name": "Kitchen / dining", "x": 4300, "y": 5800, "floor": "#b9bdbf",
  "poly": [[0, 0], [3000, 0], [3000, 4000], [0, 4000]] }
```

`x, y` is where the label goes. `poly` (optional) is the floor outline, usually the
wall centre lines around the room, and `floor` is its colour. Without any `poly`, one
rectangular floor is drawn under the whole plan.

### Furniture and kitchen units

```json
{ "id": "k4", "type": "sink-unit", "name": "Sink unit", "x": 2250, "y": 6550,
  "w": 800, "d": 600, "h": 900, "z": 0, "rot": 0, "color": "#2f4f4f", "worktop": "#d8d2c4" }
```

`x, y` is the centre of the item. `w`/`d`/`h` are width, depth and height. `z` is the
height above the floor (e.g. 1450 for wall cupboards). `rot` is the rotation in degrees.
At `rot: 0` the front of the item faces the front of the house. You'll normally add
furniture in the app rather than by hand.

> Shortcut: send your sketch with the measurements (a photo is fine) and ask Claude to
> write `plan.json` for you.

## Step 3 — Open the planner

Browsers won't load the model straight from disk, so serve the folder:

```bash
cd Ground-floor-model
python3 -m http.server 8000
# then open http://localhost:8000
```

**Or put it online for free with GitHub Pages:** go to repo **Settings → Pages**, set
*Source: Deploy from a branch*, choose the branch and `/ (root)`, and save. The
planner will then be at `https://<your-user>.github.io/Ground-floor-model/` and will
work on a phone or tablet too.

## Step 4 — Plan

| To do this… | …do this |
|---|---|
| Move furniture | Drag it. It snaps to 50 mm; hold **Shift** for 10 mm |
| Exact sizes and positions | Select the item and type values in the side panel |
| Check walkways | Select an item; the status bar shows its gap to the nearest wall or furniture in each direction |
| Move a door or window | Drag it along its wall, or type the "From start" value |
| Move an internal wall | Click it once to select it, then drag it. Walls joined to it stretch to follow |
| Swap a door for an archway / remove it | Change *Type* to `opening`, or press **Delete** |
| Design the kitchen | **Add item → Kitchen**. Units butt together neatly on 50 mm snap. Change door and worktop colours in the panel |
| See inside rooms | **Walls: cut-away** (or **C**) lowers the walls to 1 m |
| Top-down plan | **Plan view** (or **V**) |
| Undo | **Ctrl+Z** |

Changes save automatically **in that browser only**. To keep a layout permanently, click
**Export**, then replace `plan.json` in the repo with the downloaded file and commit it.

### Plans in this repo

The **Plan** drop-down in the toolbar switches between the plans stored in the repo:

| Plan | File |
|---|---|
| Current house | `plan.json` |
| Future plan 1 | `plans/future-plan-1.json` |

Each plan keeps its own browser-saved edits. **Reset** reloads the plan that's open from its
file, and **Export** downloads it under that file's name. A link can open a plan directly, for
example `…/?plan=plans/future-plan-1.json`. To add another plan, put its JSON in `plans/` and
add a line to the `PLANS` list at the top of `src/main.js`.

### Comparing options

Export each idea under its own name (e.g. `kitchen-option-a.json`,
`kitchen-option-b.json`) and switch between them with **Import**. You could also use a
git branch per option. **Reset** throws away browser changes and reloads `plan.json`.

## Typical sizes

| Item | Size (mm) |
|---|---|
| Kitchen base unit | 600 deep, 900 high incl. worktop. Widths 300 / 400 / 500 / 600 / 800 / 1000 |
| Wall unit | 300–350 deep, 720 high, bottom at ~1450 |
| Tall unit | 600 deep, 2100–2250 high |
| Walkway between worktops / an island | 1000–1200 |
| Space behind a dining chair | 900 to walk past |
| Internal door (UK) | 762 or 838 wide door leaf, 1981 high |

## Files

- `index.html`, `style.css`: the page
- `src/main.js`: scene, editing and interaction
- `src/items.js`: how each furniture type is drawn
- `src/catalog.js`: the **Add item** presets. Add your own exact products here
- `plan.json`: your house

## Limitations

Walls are straight boxes, so curved bays are drawn as a few straight segments. Curved walls, sloping ceilings and an upper floor aren't
supported yet. Furniture is drawn as simple shapes, not detailed models.
