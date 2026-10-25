/**
 * Corridor: one street, seven signal poles. The pointer is projected back onto
 * the road plane, which never moves; each pole's head lifts off its pole by the
 * distance falloff to the pointer, on its own spring, and the pole under the
 * pointer takes the bright stroke. At rest the poles stand at varied heights
 * with one bright head. The slider is the corridor radius, in world units.
 *
 * Pattern: a continuous field along one line — Terrain rest-composed, ground
 * plane hit (01), falloff with a floor (03), one bright verb (04), prism
 * silhouettes with a single crease (09).
 */
const {
  Cam, clamp, facing, fit, prism, proj, rings, seg, unproj,
  spring, stepS, mk, pointer, put, register, disposer, solid,
} = HL;

const N = 7, CELL = 21, EXT = N * CELL, PB = 5, GMAX = 34;

/** Share of full lift at u radii from the pointer: 1 → .31 at 42% → .09 beyond. */
const falloff = (u) =>
  u <= 0 ? 1 : u <= 0.417 ? 1 - (u / 0.417) * 0.6875 : u <= 1 ? 0.3125 - ((u - 0.417) / 0.583) * 0.2185 : 0.094;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const C = Cam(45, 0.5, 1.55);
  fit(C, [
    [-14, -20, -PB], [EXT + 14, 20, -PB],
    [EXT + 14, -20, 0], [-14, 20, 0],
    [(EXT - 1) / 2, 0, 84],
  ], 200, 168);
  const P = proj(C), front = facing(C);

  let R = value, over = null;

  // Street slab, then a dashed centre guide painted before what it serves.
  const g = mk("g", {}, svg);
  const [sr, si] = rings(-14, -20, EXT + 14, 20, 6, 2);
  put(solid(g), prism(P, front, sr, si, -PB, 0));
  mk("path", { d: seg(P(-8, 0, 0.05), P(EXT + 8, 0, 0.05)), class: "dash nf" }, g);

  // Poles with varied heights; the tallest pole holds the rest mark.
  let peak = 0, tallest = -1;
  const poles = [];
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1);
    const h0 =
      22 +
      16 * Math.exp(-((u - 0.18) ** 2) / 0.045) +
      10 * Math.exp(-((u - 0.78) ** 2) / 0.025);
    if (h0 > tallest) { tallest = h0; peak = i; }
    const x = i * CELL;
    const [ring, inner] = rings(x - 2, -2, x + 2, 2, 1.2, 0.5);
    const el = solid(g);
    put(el, prism(P, front, ring, inner, 0, h0));
    const [hr, hi] = rings(x - 4.2, -4.2, x + 4.2, 4.2, 2.1, 0.9);
    poles.push({ i, x, h0, hr: hr, hs: hi, elh: solid(g), sp: spring(0, { eps: 0.03 }), drawn: -1 });
  }

  function chosen() {
    if (!over) return -1;
    let best = 0, bd = Infinity;
    for (const c of poles) {
      const d = Math.abs(c.x - over[0]);
      if (d < bd) { bd = d; best = c.i; }
    }
    return best;
  }

  function drawHead(c) {
    const lift = c.sp.x;
    if (Math.abs(lift - c.drawn) < 0.03) return;
    c.drawn = lift;
    const z0 = c.h0 + 2.6 + (c.h0 - 22) * 0.04; // the rest gap varies with height
    const active = over == null ? c.i === peak : c.i === chosen();
    put(c.elh, prism(P, front, c.hr, c.hs, z0, z0 + 7 + lift));
    c.elh.sil.classList.toggle("hi", active);
  }

  function retarget() {
    for (const c of poles) {
      if (!over) {
        c.sp.t = 0;
        c.elh.sil.classList.toggle("hi", c.i === peak);
      } else {
        c.sp.t = clamp(GMAX * falloff(Math.abs(c.x - over[0]) / R), 0, GMAX);
        c.elh.sil.classList.toggle("hi", c.i === chosen());
      }
    }
    read.textContent = over == null ? "rest" : `pole ${chosen() + 1}`;
    B.wake();
  }

  const B = register(stage, (dt) => {
    let m = false;
    for (const c of poles) m = stepS(c.sp, dt) || m;
    for (const c of poles) drawHead(c);
    return m;
  });
  bag.add(B.unregister);

  bag.add(pointer(stage, {
    move: (p) => {
      over = unproj(C, p[0], p[1], 0);
      if (over[0] < -8 || over[0] > EXT + 8) over = null;
      retarget();
    },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { R = v; if (over) retarget(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "corridor",
  means: "A street of signal poles: the pointer opens a corridor and heads lift near it, falling off with distance.",
  rules: [1, 3, 5, 9],
  range: [12, 22, 38],
  tour: [[120, 190], [282, 190], [200, 148], null],
  mount,
});
