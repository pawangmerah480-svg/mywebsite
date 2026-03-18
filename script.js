/* ═══════════════════════════════════════════════════════════
   2D CHARACTER MOVEMENT — script.js
   
   Architecture:
     INPUT   → keys{}  (boolean map, keyboard + touch)
     UPDATE  → move player, clamp bounds, update stats
     RENDER  → draw world + player on canvas
     LOOP    → requestAnimationFrame orchestrates update+render
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ─────────────────────────────────────────────
// 1. CANVAS SETUP
// ─────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

// Internal resolution — canvas draws at this size, CSS scales it
const CANVAS_W = 640;
const CANVAS_H = 480;
canvas.width  = CANVAS_W;
canvas.height = CANVAS_H;

// ─────────────────────────────────────────────
// 2. GAME CONFIGURATION
// ─────────────────────────────────────────────
const config = {
  speed:      4,      // pixels per frame at 60 fps
  playerSize: 28,     // radius of the player circle
};

// ─────────────────────────────────────────────
// 3. PLAYER STATE
// ─────────────────────────────────────────────
const player = {
  x:     CANVAS_W / 2,   // current X position
  y:     CANVAS_H / 2,   // current Y position
  prevX: CANVAS_W / 2,   // previous X (for velocity calc)
  prevY: CANVAS_H / 2,
  vx:    0,              // velocity X (px/frame)
  vy:    0,              // velocity Y (px/frame)
  facing:'right',        // last non-idle direction
  skinIdx: 0,            // which skin is active
  // walk animation
  walkCycle: 0,          // accumulates while moving
  bobOffset: 0,          // vertical body bob
  legAngle:  0,          // leg swing angle
};

// ─────────────────────────────────────────────
// 4. INPUT — keys object (boolean map)
// ─────────────────────────────────────────────
/**
 * `keys` stores the current pressed state for every
 * relevant input.  Both keyboard AND touch buttons
 * write to the same object, so they are composable.
 */
const keys = {
  up:    false,
  down:  false,
  left:  false,
  right: false,
};

// ── 4a. Keyboard ──
const KEY_MAP = {
  'ArrowUp':    'up',
  'ArrowDown':  'down',
  'ArrowLeft':  'left',
  'ArrowRight': 'right',
  'w': 'up',  'W': 'up',
  's': 'down','S': 'down',
  'a': 'left','A': 'left',
  'd': 'right','D':'right',
};

window.addEventListener('keydown', e => {
  const dir = KEY_MAP[e.key];
  if (dir) {
    keys[dir] = true;
    e.preventDefault(); // prevent page scroll on arrow keys
    highlightKey(dir, true);
  }
});

window.addEventListener('keyup', e => {
  const dir = KEY_MAP[e.key];
  if (dir) {
    keys[dir] = false;
    highlightKey(dir, false);
  }
});

// Highlight the keyboard visual in the side panel
function highlightKey(dir, on) {
  const map = { up:['kw','ku'], down:['ks','kdn'], left:['ka','kl'], right:['kd','kr'] };
  (map[dir] || []).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', on);
  });
}

// ── 4b. Touch / D-Pad buttons ──
/**
 * We use touchstart/touchend (not click) for instant response.
 * Each button maps to a direction in `keys`.
 * We prevent default to avoid ghost-click and scroll.
 */
const dpadMap = {
  'btn-up':    'up',
  'btn-down':  'down',
  'btn-left':  'left',
  'btn-right': 'right',
};

Object.entries(dpadMap).forEach(([id, dir]) => {
  const btn = document.getElementById(id);
  if (!btn) return;

  // Touch events
  btn.addEventListener('touchstart', e => {
    e.preventDefault();
    keys[dir] = true;
    btn.classList.add('pressed');
  }, { passive: false });

  btn.addEventListener('touchend', e => {
    e.preventDefault();
    keys[dir] = false;
    btn.classList.remove('pressed');
  }, { passive: false });

  btn.addEventListener('touchcancel', e => {
    e.preventDefault();
    keys[dir] = false;
    btn.classList.remove('pressed');
  }, { passive: false });

  // Mouse fallback (so D-Pad works on desktop too if dragged)
  btn.addEventListener('mousedown', e => { e.preventDefault(); keys[dir] = true;  btn.classList.add('pressed'); });
  btn.addEventListener('mouseup',   e => { e.preventDefault(); keys[dir] = false; btn.classList.remove('pressed'); });
  btn.addEventListener('mouseleave',e => { keys[dir] = false; btn.classList.remove('pressed'); });
});

// Show D-Pad on first touch (hidden on desktop until needed)
window.addEventListener('touchstart', () => {
  document.getElementById('dpad').classList.add('visible');
}, { once: true, passive: true });

// ─────────────────────────────────────────────
// 5. SKINS
// ─────────────────────────────────────────────
const SKINS = [
  { emoji: '🧑', label: 'Normal',  body: '#6c63ff', shadow: '#3a35b0', outline: '#fff' },
  { emoji: '🥷', label: 'Ninja',   body: '#222',    shadow: '#000',    outline: '#f9c74f' },
  { emoji: '🤖', label: 'Robot',   body: '#78c2ff', shadow: '#3a80cc', outline: '#fff' },
  { emoji: '👾', label: 'Alien',   body: '#43e97b', shadow: '#1a9a4a', outline: '#fff' },
  { emoji: '😎', label: 'Cool',    body: '#ff6584', shadow: '#c0233e', outline: '#fff' },
  { emoji: '🧙', label: 'Mage',    body: '#9b59b6', shadow: '#6c3483', outline: '#f0e6ff' },
];

// Build skin picker UI
const skinPicker = document.getElementById('skin-picker');
SKINS.forEach((skin, i) => {
  const btn = document.createElement('button');
  btn.className = 'skin-btn' + (i === 0 ? ' selected' : '');
  btn.textContent = skin.emoji;
  btn.title = skin.label;
  btn.addEventListener('click', () => {
    player.skinIdx = i;
    document.querySelectorAll('.skin-btn').forEach((b, j) =>
      b.classList.toggle('selected', j === i)
    );
  });
  skinPicker.appendChild(btn);
});

// ─────────────────────────────────────────────
// 6. WORLD / MAP DATA
// ─────────────────────────────────────────────
// Static decorations rendered on the world background
const DECORATIONS = [
  // Trees
  { type: 'tree', x: 80,  y: 80  },
  { type: 'tree', x: 560, y: 90  },
  { type: 'tree', x: 70,  y: 390 },
  { type: 'tree', x: 570, y: 400 },
  // Rocks
  { type: 'rock', x: 200, y: 320 },
  { type: 'rock', x: 430, y: 140 },
  // Flowers
  { type: 'flower', x: 160, y: 200, color: '#ff6584' },
  { type: 'flower', x: 480, y: 280, color: '#f9c74f' },
  { type: 'flower', x: 310, y: 380, color: '#43e97b' },
  { type: 'flower', x: 95,  y: 260, color: '#ff6584' },
  { type: 'flower', x: 545, y: 200, color: '#78c2ff' },
];

// Coins to collect (just visual demo — no pickup logic in this module)
const COINS = [
  { x: 240, y: 180, collected: false },
  { x: 380, y: 280, collected: false },
  { x: 140, y: 340, collected: false },
  { x: 500, y: 350, collected: false },
  { x: 320, y: 130, collected: false },
];

// ─────────────────────────────────────────────
// 7. STATS
// ─────────────────────────────────────────────
let totalDistance = 0;
let totalTime     = 0;   // seconds
let diagCount     = 0;
let prevDiag      = false;
let frameCount    = 0;

// ─────────────────────────────────────────────
// 8. UPDATE — called every frame
// ─────────────────────────────────────────────
function update(dt) {
  // ── Read input → compute intended velocity ──
  let dx = 0;
  let dy = 0;

  if (keys.left)  dx -= 1;
  if (keys.right) dx += 1;
  if (keys.up)    dy -= 1;
  if (keys.down)  dy += 1;

  // Normalize diagonal movement so speed is consistent
  const moving = dx !== 0 || dy !== 0;
  if (dx !== 0 && dy !== 0) {
    // Pythagoras: |v| = speed, so each axis gets speed/√2
    const norm = Math.SQRT2;
    dx /= norm;
    dy /= norm;
  }

  // Apply speed
  player.vx = dx * config.speed;
  player.vy = dy * config.speed;

  // ── Move player ──
  player.prevX = player.x;
  player.prevY = player.y;
  player.x += player.vx;
  player.y += player.vy;

  // ── Bound check — keep player inside canvas ──
  const r = config.playerSize;
  player.x = Math.max(r, Math.min(CANVAS_W - r, player.x));
  player.y = Math.max(r, Math.min(CANVAS_H - r, player.y));

  // ── Update facing direction ──
  if (dx > 0) player.facing = 'right';
  else if (dx < 0) player.facing = 'left';
  else if (dy < 0) player.facing = 'up';
  else if (dy > 0) player.facing = 'down';

  // ── Walk animation ──
  if (moving) {
    player.walkCycle += dt * 6;          // radians per second
    player.bobOffset  = Math.sin(player.walkCycle) * 3;
    player.legAngle   = Math.sin(player.walkCycle) * 28; // degrees
  } else {
    // Ease back to rest
    player.bobOffset  = player.bobOffset  * 0.85;
    player.legAngle   = player.legAngle   * 0.75;
    if (Math.abs(player.bobOffset) < 0.1)  player.bobOffset = 0;
    if (Math.abs(player.legAngle)  < 0.5)  player.legAngle  = 0;
  }

  // ── Coin collection ──
  const pr = config.playerSize * 0.9;
  for (const coin of COINS) {
    if (!coin.collected) {
      const d = Math.hypot(player.x - coin.x, player.y - coin.y);
      if (d < pr + 10) coin.collected = true;
    }
  }

  // ── Stats ──
  const moved = Math.hypot(player.x - player.prevX, player.y - player.prevY);
  totalDistance += moved;
  totalTime     += dt;

  const isDiag = dx !== 0 && dy !== 0;
  if (isDiag && !prevDiag) diagCount++;
  prevDiag = isDiag;

  frameCount++;
}

// ─────────────────────────────────────────────
// 9. RENDER — called every frame after update
// ─────────────────────────────────────────────

// Animated grass phase
let grassPhase = 0;
let coinPhase  = 0;

function render(dt) {
  grassPhase += dt * 1.8;
  coinPhase  += dt * 3.0;

  // ── Background ──
  drawBackground();

  // ── Decorations ──
  DECORATIONS.forEach(d => drawDecoration(d));

  // ── Coins ──
  COINS.forEach(c => drawCoin(c));

  // ── Player shadow ──
  drawShadow(player.x, player.y + config.playerSize * 0.7, config.playerSize);

  // ── Player character ──
  drawPlayer();

  // ── Velocity trail ──
  drawTrail();

  // ── Boundary indicators (subtle glow on edges) ──
  drawBoundaryGlow();
}

// ── Background tiles ──
function drawBackground() {
  // Grass base
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#1d3a1e');
  grad.addColorStop(1, '#162b17');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Subtle grid pattern
  ctx.strokeStyle = 'rgba(255,255,255,.04)';
  ctx.lineWidth   = 1;
  const GRID = 40;
  for (let x = 0; x < CANVAS_W; x += GRID) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
  }
  for (let y = 0; y < CANVAS_H; y += GRID) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
  }

  // Animated grass tufts along the top edge
  for (let gx = 20; gx < CANVAS_W; gx += 18) {
    const sway = Math.sin(grassPhase + gx * 0.15) * 3;
    ctx.save();
    ctx.translate(gx, 8);
    ctx.strokeStyle = '#2d5a30';
    ctx.lineWidth   = 2;
    ctx.lineCap     = 'round';
    for (let b = 0; b < 3; b++) {
      const bx = (b - 1) * 5;
      ctx.beginPath();
      ctx.moveTo(bx, 0);
      ctx.quadraticCurveTo(bx + sway, -8, bx + sway * 1.4, -14);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// ── Decorations ──
function drawDecoration(d) {
  ctx.save();
  ctx.translate(d.x, d.y);

  if (d.type === 'tree') {
    // Trunk
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(-5, 0, 10, 20);
    // Canopy layers
    [[0, -10, 28], [-5, -24, 24], [0, -36, 18]].forEach(([ox, oy, r]) => {
      ctx.fillStyle = '#2e7d32';
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#388e3c';
      ctx.beginPath();
      ctx.arc(ox - 4, oy - 4, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
    });

  } else if (d.type === 'rock') {
    ctx.fillStyle = '#546e7a';
    ctx.beginPath();
    ctx.ellipse(0, 2, 18, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#78909c';
    ctx.beginPath();
    ctx.ellipse(-3, -1, 12, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();

  } else if (d.type === 'flower') {
    // Stem
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth   = 2;
    ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, -2); ctx.stroke();
    // Petals
    const sway = Math.sin(grassPhase + d.x * 0.2) * 5;
    ctx.fillStyle = d.color;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + sway * 0.05;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * 5, -10 + Math.sin(a) * 5, 4, 3, a, 0, Math.PI * 2);
      ctx.fill();
    }
    // Center
    ctx.fillStyle = '#fff9c4';
    ctx.beginPath(); ctx.arc(0, -10, 3.5, 0, Math.PI * 2); ctx.fill();
  }

  ctx.restore();
}

// ── Coin ──
function drawCoin(c) {
  if (c.collected) return;
  ctx.save();
  ctx.translate(c.x, c.y + Math.sin(coinPhase + c.x * 0.05) * 3);

  // Glow
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 14);
  g.addColorStop(0, 'rgba(249,199,79,.35)');
  g.addColorStop(1, 'rgba(249,199,79,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();

  // Coin body (spinning illusion via x-scale)
  const scaleX = Math.cos(coinPhase * 1.5 + c.x * 0.1);
  ctx.scale(scaleX, 1);
  ctx.fillStyle = '#f9c74f';
  ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffe082';
  ctx.beginPath(); ctx.arc(-2, -2, 4, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

// ── Shadow ellipse ──
function drawShadow(x, y, r) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.7, r * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ── Player character ──
function drawPlayer() {
  const skin = SKINS[player.skinIdx];
  const r    = config.playerSize;
  const x    = player.x;
  const y    = player.y + player.bobOffset;

  ctx.save();
  ctx.translate(x, y);

  // Flip sprite based on facing
  if (player.facing === 'left') ctx.scale(-1, 1);

  const LA = player.legAngle * (Math.PI / 180); // radians

  // ── Legs ──
  ctx.lineWidth  = r * 0.38;
  ctx.lineCap    = 'round';
  ctx.strokeStyle = skin.body + 'cc';

  // Left leg (swings forward when right leg is back)
  ctx.save();
  ctx.translate(-r * 0.28, r * 0.3);
  ctx.rotate(-LA);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, r * 0.55);
  ctx.stroke();
  ctx.restore();

  // Right leg (opposite phase)
  ctx.save();
  ctx.translate(r * 0.28, r * 0.3);
  ctx.rotate(LA);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, r * 0.55);
  ctx.stroke();
  ctx.restore();

  // ── Body ──
  const bodyGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 0, 0, 0, r);
  bodyGrad.addColorStop(0, lighten(skin.body, 40));
  bodyGrad.addColorStop(1, skin.body);
  ctx.fillStyle   = bodyGrad;
  ctx.strokeStyle = skin.outline;
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // ── Inner ring ──
  ctx.strokeStyle = 'rgba(255,255,255,.2)';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
  ctx.stroke();

  // ── Arms ──
  ctx.strokeStyle = skin.body;
  ctx.lineWidth   = r * 0.32;
  ctx.lineCap     = 'round';

  // Left arm
  ctx.save();
  ctx.translate(-r * 0.6, -r * 0.1);
  ctx.rotate(LA * 0.6);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, r * 0.4); ctx.stroke();
  ctx.restore();

  // Right arm
  ctx.save();
  ctx.translate(r * 0.6, -r * 0.1);
  ctx.rotate(-LA * 0.6);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, r * 0.4); ctx.stroke();
  ctx.restore();

  // ── Eyes ──
  const eyeOffX = player.facing === 'left' ? -r * 0.25 : r * 0.25;
  const eyeOffY = -r * 0.12;
  const eyeR    = r * 0.14;

  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(eyeOffX - r * 0.14, eyeOffY, eyeR, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(eyeOffX + r * 0.14, eyeOffY, eyeR, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#1a1a2e';
  const look    = 0.04 * r;
  ctx.beginPath(); ctx.arc(eyeOffX - r * 0.14 + look, eyeOffY + look, eyeR * 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(eyeOffX + r * 0.14 + look, eyeOffY + look, eyeR * 0.6, 0, Math.PI * 2); ctx.fill();

  // Eye shine
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  ctx.beginPath(); ctx.arc(eyeOffX - r * 0.14 + look - 1, eyeOffY + look - 1, eyeR * 0.25, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(eyeOffX + r * 0.14 + look - 1, eyeOffY + look - 1, eyeR * 0.25, 0, Math.PI * 2); ctx.fill();

  // ── Emoji label (skin identity) ──
  ctx.font          = `${r * 0.6}px serif`;
  ctx.textAlign     = 'center';
  ctx.textBaseline  = 'middle';
  ctx.fillText(skin.emoji, 0, r * 0.3);

  ctx.restore();
}

// ── Velocity trail ──
const trailPoints = [];
const TRAIL_LEN   = 8;

function drawTrail() {
  const speed = Math.hypot(player.vx, player.vy);
  if (speed > 0.5) {
    trailPoints.unshift({ x: player.x, y: player.y, life: 1 });
  }
  while (trailPoints.length > TRAIL_LEN) trailPoints.pop();

  const skin = SKINS[player.skinIdx];
  trailPoints.forEach((p, i) => {
    p.life -= 0.12;
    if (p.life <= 0) return;
    const alpha = p.life * 0.35;
    const radius = config.playerSize * (p.life * 0.4);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = skin.shadow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

// ── Edge boundary glow ──
function drawBoundaryGlow() {
  const p  = player;
  const r  = config.playerSize;
  const pad = 4;

  const nearLeft  = p.x <= r + pad;
  const nearRight = p.x >= CANVAS_W - r - pad;
  const nearTop   = p.y <= r + pad;
  const nearBottom= p.y >= CANVAS_H - r - pad;

  if (nearLeft || nearRight || nearTop || nearBottom) {
    ctx.save();
    ctx.strokeStyle = '#ff6584';
    ctx.lineWidth   = 3;
    ctx.globalAlpha = 0.6;
    ctx.strokeRect(1, 1, CANVAS_W - 2, CANVAS_H - 2);
    ctx.restore();
  }
}

// ─────────────────────────────────────────────
// 10. HUD UPDATE
// ─────────────────────────────────────────────
function updateHUD() {
  // Position
  document.getElementById('hud-pos').textContent =
    `📍 X: ${Math.round(player.x)} · Y: ${Math.round(player.y)}`;

  // Speed in px/s
  const speed = Math.round(Math.hypot(player.vx, player.vy) * 60);
  document.getElementById('hud-speed').textContent = `⚡ ${speed} px/s`;

  // Direction label
  const isDiag = (keys.up || keys.down) && (keys.left || keys.right);
  let dir = 'Idle';
  if (keys.up && keys.left)    dir = '↖ Kiri-Atas';
  else if (keys.up && keys.right)  dir = '↗ Kanan-Atas';
  else if (keys.down && keys.left) dir = '↙ Kiri-Bawah';
  else if (keys.down && keys.right)dir = '↘ Kanan-Bawah';
  else if (keys.up)    dir = '⬆ Atas';
  else if (keys.down)  dir = '⬇ Bawah';
  else if (keys.left)  dir = '⬅ Kiri';
  else if (keys.right) dir = '➡ Kanan';
  document.getElementById('hud-dir').textContent = `🧭 ${dir}`;

  // Stats panel (not on mobile — hidden via CSS)
  document.getElementById('stat-dist').textContent = `${Math.round(totalDistance)} px`;
  document.getElementById('stat-time').textContent = `${Math.floor(totalTime)}s`;
  document.getElementById('stat-diag').textContent = `${diagCount}×`;
}

// ─────────────────────────────────────────────
// 11. CONTROLS PANEL BINDINGS
// ─────────────────────────────────────────────

// Speed slider
const speedSlider = document.getElementById('speed-slider');
const speedVal    = document.getElementById('speed-val');
speedSlider.addEventListener('input', () => {
  config.speed = +speedSlider.value;
  speedVal.textContent = config.speed;
});

// Size slider
const sizeSlider = document.getElementById('size-slider');
const sizeVal    = document.getElementById('size-val');
sizeSlider.addEventListener('input', () => {
  config.playerSize = +sizeSlider.value;
  sizeVal.textContent = config.playerSize;
});

// Reset button
document.getElementById('btn-reset').addEventListener('click', () => {
  player.x = player.prevX = CANVAS_W / 2;
  player.y = player.prevY = CANVAS_H / 2;
  player.vx = player.vy = 0;
  player.walkCycle = player.bobOffset = player.legAngle = 0;
  trailPoints.length = 0;
  // Reset coins
  COINS.forEach(c => c.collected = false);
  // Reset stats
  totalDistance = totalTime = diagCount = 0; prevDiag = false;
});

// ─────────────────────────────────────────────
// 12. UTILITY
// ─────────────────────────────────────────────

/**
 * Lighten a hex color by `amount` (0-255)
 */
function lighten(hex, amount) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const clamp = v => Math.min(255, v + amount);
  return `rgb(${clamp(r)},${clamp(g)},${clamp(b)})`;
}

// ─────────────────────────────────────────────
// 13. MAIN GAME LOOP — requestAnimationFrame
// ─────────────────────────────────────────────
let lastTime = 0;

/**
 * The loop is called by the browser ~60 times per second.
 * `timestamp` is a high-resolution DOMHighResTimeStamp.
 *
 * Flow:
 *   timestamp → compute dt (delta time in seconds)
 *             → update(dt)   [physics / input / logic]
 *             → render(dt)   [draw everything to canvas]
 *             → updateHUD()  [update DOM elements]
 *             → schedule next frame
 */
function gameLoop(timestamp) {
  // dt = time since last frame, capped at 100ms to avoid spiral-of-death
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;

  update(dt);
  render(dt);
  updateHUD();

  requestAnimationFrame(gameLoop); // schedule next frame
}

// ── KICK OFF ──
requestAnimationFrame(ts => {
  lastTime = ts;
  requestAnimationFrame(gameLoop);
});
