/**
 * CBC Ballistic Calculator — physics.js
 * Copyright (C) 2025 kbedn455
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CBC Ballistic Physics
 * Create Big Cannons 5.11.3
 *
 * Formulas by sashafiesta (CBC Discord: discord.gg/vgfMMUUgvT)
 * Empirical calibration by in-game measurements (CBC 5.11.3)
 *
 * Constants:
 *   drag     = 0.99 per tick
 *   gravity  = 0.05 blocks/tick²
 *   1 tick   = 1/20 second
 *
 * Velocity formula:
 *   V = (powder * 40 + cartridge * cartVel) / 20  [blocks/tick]
 */

const DRAG = 0.99;
const GRAV = 0.05;

const MAT_LIMITS = {
  log: 1,
  wrought: 2,
  cast: 3,
  bronze: 4,
  steel: 6,
  nether: 32,
};

const CART_POWER = {
  1: { vel: 40,  stress: 0.5 },
  2: { vel: 80,  stress: 1.0 },
  3: { vel: 120, stress: 1.5 },
  4: { vel: 160, stress: 2.0 },
};

/**
 * Convert charges to internal velocity (blocks/tick)
 * cart: 0 = brak, 1 = aktywny
 */
function getV(pow, cart, cartPower) {
  const powVel  = pow  * 40;
  const cartVel = cart * CART_POWER[cartPower].vel;
  return (powVel + cartVel) / 20;
}

/**
 * Simulate vertical flight time from y0 to y (sashafiesta's f function)
 */
function timeInAir(y0, y, Vy) {
  let t = 0, cy = y0, v = Vy;
  if (y0 <= y) {
    while (t < 200000) { cy += v; v = v * DRAG - GRAV; t++; if (cy > y) break; }
  }
  while (t < 200000) { cy += v; v = v * DRAG - GRAV; t++; if (cy <= y) return t; }
  return -1;
}

/**
 * Horizontal travel time for distance d at speed Vw
 * Formula: |ln(1 - d/(100*Vw)) / ln(0.99)|
 */
function timeXZ(d, Vw) {
  if (Vw <= 0) return Infinity;
  const inner = 1 - d / (100 * Vw);
  if (inner <= 0) return Infinity;
  return Math.abs(Math.log(inner) / Math.log(DRAG));
}

/**
 * Calculate yaw from cannon to target
 * CBC system: 0° = South (+Z), increases toward West (-X)
 */
function calcYaw(cx, cz, tx, tz) {
  const dx = tx - cx, dz = tz - cz;
  let yaw = Math.atan2(-dx, dz) * 180 / Math.PI;
  return ((yaw % 360) + 360) % 360;
}

/**
 * Brute-force optimal pitch angle (sashafiesta method)
 * Returns { angle, time } or null if unreachable
 */
function findPitch(V, d, cannonY, targetY) {
  let bestAngle = 0, bestDt = Infinity, bestTime = 0;
  for (let A = -30; A <= 60; A += 0.05) {
    const rad = A * Math.PI / 180;
    const Vw  = Math.cos(rad) * V;
    const Vy  = Math.sin(rad) * V;
    const t1  = timeXZ(d, Vw);
    if (!isFinite(t1)) continue;
    const t2  = timeInAir(cannonY, targetY, Vy);
    if (t2 < 0) continue;
    const dt  = Math.abs(t1 - t2);
    if (dt < bestDt) { bestDt = dt; bestAngle = A; bestTime = (t1 + t2) / 2; }
  }
  return bestDt < 25 ? { angle: bestAngle, time: bestTime } : null;
}

/**
 * Simulate full projectile trajectory
 * Returns array of {x, y} points
 */
function simulateTrajectory(V, angleDeg, startH) {
  const rad = angleDeg * Math.PI / 180;
  let vx = Math.cos(rad) * V;
  let vy = Math.sin(rad) * V;
  let x = 0, y = parseFloat(startH);
  const pts = [{ x: 0, y: y }];
  for (let i = 0; i < 200000; i++) {
    vx *= DRAG;
    vy  = vy * DRAG - GRAV;
    x  += vx;
    y  += vy;
    if (y <= 0) { pts.push({ x: Math.round(x), y: 0 }); break; }
    if (i % 4 === 0) pts.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
  }
  return pts;
}

/**
 * Find maximum range and optimal angle for given V
 */
function maxRange(V) {
  let best = 0, bestAngle = 0;
  for (let a = 0; a <= 60; a++) {
    const pts = simulateTrajectory(V, a, 3);
    const r   = pts[pts.length - 1].x;
    if (r > best) { best = r; bestAngle = a; }
  }
  return { range: best, angle: bestAngle };
}
