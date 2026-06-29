/**
 * CBC Ballistic Calculator — ui.js
 * Copyright (C) 2025 kbedn455
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CBC Ballistic Calculator — UI
 */

let corrActive = false;
let origY      = null;
let mChart     = null;

// ─── HELPERS ─────────────────────────────────────────────────────

function show(id) { const el = document.getElementById(id); if (el) el.style.display = 'block'; }
function hide(...ids) { ids.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; }); }

function setAngleOpts(prefix, exact) {
  const lo   = Math.floor(exact);
  const hi   = Math.ceil(exact);
  const frac = exact - lo;
  const closer = T[lang].closer;
  document.getElementById(prefix + '-lo-v').textContent = lo + '°';
  document.getElementById(prefix + '-hi-v').textContent = hi + '°';
  document.getElementById(prefix + '-lo-s').textContent = frac < 0.5  ? '← ' + closer : '';
  document.getElementById(prefix + '-hi-s').textContent = frac >= 0.5 ? '← ' + closer : '';
  document.getElementById(prefix + '-lo').className = 'angle-opt' + (frac < 0.5  ? ' best' : '');
  document.getElementById(prefix + '-hi').className = 'angle-opt' + (frac >= 0.5 ? ' best' : '');
}

// ─── TABS ─────────────────────────────────────────────────────────

function switchTab(name, e) {
  document.querySelectorAll('.tab').forEach(t  => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  e.target.classList.add('active');
}

// ─── CHARGE INFO ──────────────────────────────────────────────────

function updateCartInfo(prefix) {
  const isT    = prefix === 't';
  const active = document.getElementById(isT ? 't-cart' : 'm-cart').checked;
  const power  = parseInt(document.getElementById(isT ? 't-power' : 'm-power').value);
  const p      = CART_POWER[power];
  const totalV = active ? p.vel   : 0;
  const totalS = active ? p.stress.toFixed(1) : '0.0';

  document.getElementById(isT ? 't-cart-total'  : 'm-cart-total').textContent  = '+' + totalV + ' m/s';
  document.getElementById(isT ? 't-cart-stress' : 'm-cart-stress').textContent = totalS;

  if (isT) {
    const pow = parseInt(document.getElementById('t-pow').value);
    document.getElementById('t-pow-total').textContent = '+' + (pow * 40) + ' m/s';
  } else {
    const pow = parseInt(document.getElementById('m-pow').value);
    document.getElementById('m-pow-total').textContent  = '+' + (pow * 40) + ' m/s';
    document.getElementById('m-pow-stress').textContent = (pow * 1.0).toFixed(1);
  }
}

// ─── Y CORRECTION ─────────────────────────────────────────────────

function applyCorr() {
  const inp = document.getElementById('ty');
  const val = parseFloat(inp.value);
  if (isNaN(val)) return;
  if (!corrActive) {
    origY     = val;
    inp.value = val - 25;
    corrActive = true;
    document.getElementById('corr-btn').classList.add('active');
    document.getElementById('corr-btn').textContent  = T[lang].corr_undo;
    document.getElementById('corr-info').textContent = 'Y: ' + origY + ' → ' + (val - 25) + ' (−25)';
  } else {
    inp.value  = origY;
    corrActive = false;
    origY      = null;
    document.getElementById('corr-btn').classList.remove('active');
    document.getElementById('corr-btn').textContent  = T[lang].corr_btn;
    document.getElementById('corr-info').textContent = '';
  }
  calc();
}

function resetCorr() {
  if (!corrActive) return;
  corrActive = false;
  origY      = null;
  document.getElementById('corr-btn').classList.remove('active');
  document.getElementById('corr-btn').textContent  = T[lang].corr_btn;
  document.getElementById('corr-info').textContent = '';
}

// ─── XYZ TARGET CALCULATION ───────────────────────────────────────

function calc() {
  const cx   = parseFloat(document.getElementById('cx').value);
  const cy   = parseFloat(document.getElementById('cy').value);
  const cz   = parseFloat(document.getElementById('cz').value);
  const tx   = parseFloat(document.getElementById('tx').value);
  const ty   = parseFloat(document.getElementById('ty').value);
  const tz   = parseFloat(document.getElementById('tz').value);
  const pow  = parseInt(document.getElementById('t-pow').value);
  const cart = document.getElementById('t-cart').checked ? 1 : 0;
  const cartPower = parseInt(document.getElementById('t-power').value);

  document.getElementById('t-pow-total').textContent = '+' + (pow * 40) + ' m/s';
  updateCartInfo('t');

  hide('w-input', 'w-pitch', 'w-ricochet', 'w-jam', 'results');

  if ([cx, cy, cz, tx, ty, tz].some(isNaN)) { show('w-input'); return; }

  const V = getV(pow, cart, cartPower);
  if (V === 0) { show('w-input'); return; }

  const powEquiv = pow + cart * cartPower;
  if (powEquiv > 6) show('w-jam');

  const dx  = tx - cx, dz = tz - cz;
  const d   = Math.sqrt(dx * dx + dz * dz);
  const yaw = calcYaw(cx, cz, tx, tz);
  const res = findPitch(V, d, cy, ty);

  if (!res) { show('w-pitch'); return; }
  if (res.angle < 15) show('w-ricochet');

  const fuze = Math.max(0, Math.round(res.time) - 10);

  document.getElementById('r-dist').innerHTML  = Math.round(d)          + '<span class="metric-unit"> bl</span>';
  document.getElementById('r-time').innerHTML  = Math.round(res.time)   + '<span class="metric-unit"> tick</span>';
  document.getElementById('r-fuze').innerHTML  = fuze                   + '<span class="metric-unit"> tick</span>';
  document.getElementById('r-dy').textContent  = T[lang].dy_label + ' ' + (ty - cy) + ' bl' + (corrActive ? ' ' + T[lang].dy_corr : '');
  document.getElementById('r-corr-note').style.display = corrActive ? 'block' : 'none';

  setAngleOpts('y', yaw);
  setAngleOpts('p', res.angle);
  show('results');
}

// ─── MANUAL CALCULATION ───────────────────────────────────────────

function calcM() {
  const pow       = parseInt(document.getElementById('m-pow').value);
  const cart      = document.getElementById('m-cart').checked ? 1 : 0;
  const cartPower = parseInt(document.getElementById('m-power').value);
  const angle     = parseInt(document.getElementById('m-angle').value);
  const h         = parseInt(document.getElementById('m-height').value);
  const mat       = document.getElementById('m-mat').value;
  const proj      = document.getElementById('m-proj').value;

  document.getElementById('m-pow-total').textContent  = '+' + (pow * 40) + ' m/s';
  document.getElementById('m-pow-stress').textContent = (pow * 1.0).toFixed(1);
  updateCartInfo('m');

  hide('m-warn-jam', 'm-warn-mortar', 'm-warn-rico', 'm-warn-nocharge');

  const V        = getV(pow, cart, cartPower);
  const powEquiv = pow + cart * cartPower;
  const isMortar = proj === 'mortar';

  if (powEquiv > MAT_LIMITS[mat]) show('m-warn-jam');
  if (isMortar && V * 20 > 120)   show('m-warn-mortar');
  if (angle < 15)                  show('m-warn-rico');

  const effV = (isMortar && V * 20 > 120) ? 6 : V;

  if (effV === 0) {
    show('m-warn-nocharge');
    document.getElementById('m-maxbar').style.display = 'none';
    if (mChart) { mChart.destroy(); mChart = null; }
    return;
  }

  const pts  = simulateTrajectory(effV, angle, h);
  const maxR = pts[pts.length - 1].x;
  const maxH = Math.max(...pts.map(p => p.y));

  document.getElementById('m-vel').innerHTML   = Math.round(effV * 20) + '<span class="metric-unit"> m/s</span>';
  document.getElementById('m-range').innerHTML = Math.round(maxR)      + '<span class="metric-unit"> ' + T[lang].blocks + '</span>';
  document.getElementById('m-maxh').innerHTML  = Math.round(maxH)      + '<span class="metric-unit"> ' + T[lang].blocks + '</span>';

  const mr = maxRange(effV);
  document.getElementById('m-maxrange').textContent = Math.round(mr.range);
  document.getElementById('m-maxangle').textContent = mr.angle;
  show('m-maxbar');

  renderChart(pts);
}

// ─── CHART ────────────────────────────────────────────────────────

function renderChart(pts) {
  if (mChart) mChart.destroy();
  mChart = new Chart(document.getElementById('m-chart'), {
    type: 'line',
    data: {
      labels: pts.map(p => p.x.toFixed(0)),
      datasets: [{
        data: pts.map(p => p.y),
        borderColor: '#e8a23a',
        backgroundColor: 'rgba(232,162,58,0.08)',
        borderWidth: 2, pointRadius: 0, fill: true, tension: 0.3
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          title: { display: true, text: T[lang].range_axis, color: '#8b90a8', font: { size: 11 } },
          ticks: { color: '#8b90a8', autoSkip: true, maxTicksLimit: 12 },
          grid:  { color: '#2e3248' }
        },
        y: {
          title: { display: true, text: T[lang].height_axis, color: '#8b90a8', font: { size: 11 } },
          min: 0,
          ticks: { color: '#8b90a8' },
          grid:  { color: '#2e3248' }
        }
      }
    }
  });
}

// ─── INIT ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  updateCartInfo('t');
  updateCartInfo('m');
  calcM();
});
