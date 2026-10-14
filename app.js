/**
 * Discrete Probability Distributions - AIML Lab Educational Web App
 * Covers Binomial, Poisson, and Geometric modules + Exercises
 */

// ================= GLOBAL STATE =================
const state = {
  activeTab: 'home',
  binomial: {
    n: 20,
    p: 0.35,
    pmfK: 7,
    cdfK: 7
  },
  poisson: {
    lambda: 6.0,
    pmfK: 8,
    cdfK: 5
  },
  geometric: {
    p: 0.25,
    maxK: 20
  }
};

let binomChartInstance = null;
let poissonChartInstance = null;
let geomChartInstance = null;

// ================= MATH HELPER FUNCTIONS =================
// Log-Gamma approximation (Lanczos) for accurate factorial / combinations
function logGamma(z) {
  const c = [
    57.1562356658629235,
    -59.5979603554754912,
    14.1360979747417471,
    -0.491913816097620199,
    0.339946499848118887e-4,
    0.465236289270485756e-4,
    -0.983744753048795646e-4,
    0.158088703224370008e-3,
    -0.210264441724104883e-3,
    0.217439618115212643e-3,
    -0.164318106536763890e-3,
    0.844182239838527433e-4,
    -0.261908384015814087e-4,
    0.368991826595316234e-5
  ];
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  }
  let sum = 0.99999999999999709182;
  const x = z - 1;
  for (let i = 0; i < c.length; i++) {
    sum += c[i] / (x + i + 1);
  }
  const t = x + c.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(sum);
}

function logFactorial(n) {
  if (n < 0) return 0;
  if (n === 0 || n === 1) return 0;
  return logGamma(n + 1);
}

function logCombination(n, k) {
  if (k < 0 || k > n) return -Infinity;
  if (k === 0 || k === n) return 0;
  return logFactorial(n) - logFactorial(k) - logFactorial(n - k);
}

// Binomial PMF: P(X = k) = C(n, k) * p^k * (1 - p)^(n - k)
function binomialPMF(k, n, p) {
  if (k < 0 || k > n) return 0;
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  const logP = logCombination(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p);
  return Math.exp(logP);
}

// Binomial CDF: P(X <= k)
function binomialCDF(k, n, p) {
  if (k < 0) return 0;
  if (k >= n) return 1;
  let sum = 0;
  for (let i = 0; i <= k; i++) {
    sum += binomialPMF(i, n, p);
  }
  return Math.min(1, Math.max(0, sum));
}

// Poisson PMF: P(X = k) = (e^-lambda * lambda^k) / k!
function poissonPMF(k, lambda) {
  if (k < 0 || lambda <= 0) return 0;
  const logP = -lambda + k * Math.log(lambda) - logFactorial(k);
  return Math.exp(logP);
}

// Poisson CDF: P(X <= k)
function poissonCDF(k, lambda) {
  if (k < 0) return 0;
  let sum = 0;
  for (let i = 0; i <= k; i++) {
    sum += poissonPMF(i, lambda);
  }
  return Math.min(1, Math.max(0, sum));
}

// Geometric PMF: P(X = k) = (1 - p)^(k - 1) * p for k >= 1
function geometricPMF(k, p) {
  if (k < 1 || p <= 0 || p > 1) return 0;
  return Math.pow(1 - p, k - 1) * p;
}

// ================= TAB NAVIGATION =================
function switchTab(tabName) {
  state.activeTab = tabName;
  document.querySelectorAll('.nav-btn').forEach(btn => {
    const isTarget = btn.getAttribute('data-tab') === tabName;
    btn.classList.toggle('active', isTarget);
    btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
  });

  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `tab-${tabName}`);
  });

  // Re-render chart for current tab to adjust to container width
  if (tabName === 'binomial') {
    setTimeout(renderBinomialChart, 50);
  } else if (tabName === 'poisson') {
    setTimeout(renderPoissonChart, 50);
  } else if (tabName === 'geometric') {
    setTimeout(renderGeometricChart, 50);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================= BINOMIAL DISTRIBUTION MODULE =================
function initBinomialModule() {
  const nSlider = document.getElementById('binom-n-slider');
  const nInput = document.getElementById('binom-n');
  const pSlider = document.getElementById('binom-p-slider');
  const pInput = document.getElementById('binom-p');
  const pmfKInput = document.getElementById('pmf-k');
  const cdfKInput = document.getElementById('cdf-k');

  function updateN(val) {
    let n = parseInt(val, 10);
    const errEl = document.getElementById('binom-n-err');
    if (isNaN(n) || n < 1) {
      errEl.textContent = 'n must be a positive integer (n >= 1).';
      errEl.style.display = 'block';
      return;
    }
    errEl.style.display = 'none';
    if (n > 200) n = 200; // sensible lab ceiling for visualization
    state.binomial.n = n;
    nSlider.value = Math.min(n, 100);
    nInput.value = n;
    document.getElementById('binom-n-val').textContent = n;
    document.getElementById('summary-n').textContent = n;

    // Update k constraints
    pmfKInput.max = n;
    cdfKInput.max = n;
    document.getElementById('pmf-k-hint').textContent = `Constraint: 0 <= k <= ${n}`;
    document.getElementById('cdf-k-hint').textContent = `Constraint: 0 <= k <= ${n}`;
    if (state.binomial.pmfK > n) {
      state.binomial.pmfK = Math.round(n * state.binomial.p);
      pmfKInput.value = state.binomial.pmfK;
    }
    if (state.binomial.cdfK > n) {
      state.binomial.cdfK = Math.round(n * state.binomial.p);
      cdfKInput.value = state.binomial.cdfK;
    }

    recomputeBinomial();
  }

  function updateP(val) {
    let p = parseFloat(val);
    const errEl = document.getElementById('binom-p-err');
    if (isNaN(p) || p < 0 || p > 1) {
      errEl.textContent = 'p must be between 0 and 1.';
      errEl.style.display = 'block';
      return;
    }
    errEl.style.display = 'none';
    state.binomial.p = p;
    pSlider.value = p;
    pInput.value = p;
    document.getElementById('binom-p-val').textContent = p.toFixed(2);
    document.getElementById('summary-p').textContent = p.toFixed(2);
    document.getElementById('summary-q').textContent = (1 - p).toFixed(2);

    recomputeBinomial();
  }

  nSlider.addEventListener('input', e => updateN(e.target.value));
  nInput.addEventListener('change', e => updateN(e.target.value));
  pSlider.addEventListener('input', e => updateP(e.target.value));
  pInput.addEventListener('change', e => updateP(e.target.value));

  // PMF k input
  pmfKInput.addEventListener('input', e => {
    let k = parseInt(e.target.value, 10);
    const errEl = document.getElementById('pmf-k-err');
    const n = state.binomial.n;
    if (isNaN(k) || k < 0 || k > n) {
      errEl.textContent = `k must satisfy 0 <= k <= ${n}`;
      errEl.style.display = 'block';
      return;
    }
    errEl.style.display = 'none';
    state.binomial.pmfK = k;
    updateBinomialPMFDisplay();
    renderBinomialChart();
  });

  // CDF k input
  cdfKInput.addEventListener('input', e => {
    let k = parseInt(e.target.value, 10);
    const errEl = document.getElementById('cdf-k-err');
    const n = state.binomial.n;
    if (isNaN(k) || k < 0 || k > n) {
      errEl.textContent = `k must satisfy 0 <= k <= ${n}`;
      errEl.style.display = 'block';
      return;
    }
    errEl.style.display = 'none';
    state.binomial.cdfK = k;
    updateBinomialCDFDisplay();
  });

  // Initial calculation
  recomputeBinomial();
}

function resetBinomialDefaults() {
  document.getElementById('binom-n').value = 20;
  document.getElementById('binom-n-slider').value = 20;
  document.getElementById('binom-p').value = 0.35;
  document.getElementById('binom-p-slider').value = 0.35;
  document.getElementById('pmf-k').value = 7;
  document.getElementById('cdf-k').value = 7;

  state.binomial.n = 20;
  state.binomial.p = 0.35;
  state.binomial.pmfK = 7;
  state.binomial.cdfK = 7;

  document.getElementById('binom-n-val').textContent = '20';
  document.getElementById('summary-n').textContent = '20';
  document.getElementById('binom-p-val').textContent = '0.35';
  document.getElementById('summary-p').textContent = '0.35';
  document.getElementById('summary-q').textContent = '0.65';

  recomputeBinomial();
}

function recomputeBinomial() {
  const { n, p } = state.binomial;

  // Prompt 3: Statistics calculations
  const mean = n * p;
  const variance = n * p * (1 - p);
  const std = Math.sqrt(variance);
  const secondMoment = variance + Math.pow(mean, 2);
  const skewness = (variance > 0) ? (1 - 2 * p) / std : 0;

  document.getElementById('stat-mean').textContent = mean.toFixed(4);
  document.getElementById('stat-var').textContent = variance.toFixed(4);
  document.getElementById('stat-std').textContent = std.toFixed(4);
  document.getElementById('stat-second-moment').textContent = secondMoment.toFixed(4);
  document.getElementById('stat-skewness').textContent = skewness.toFixed(4);

  // Verification badge check for default (n=20, p=0.35)
  const isDefault = (n === 20 && Math.abs(p - 0.35) < 0.001);
  const badge = document.getElementById('default-verification-badge');
  if (isDefault) {
    badge.innerHTML = '&#10004; Verified for default values: Mean = <strong>7</strong>, Variance = <strong>4.55</strong>.';
    badge.style.display = 'inline-block';
  } else {
    badge.innerHTML = `Current configuration: Mean = <strong>${mean.toFixed(2)}</strong>, Variance = <strong>${variance.toFixed(2)}</strong>`;
    badge.style.display = 'inline-block';
  }

  updateBinomialPMFDisplay();
  updateBinomialCDFDisplay();
  renderBinomialChart();
}

function updateBinomialPMFDisplay() {
  const { n, p, pmfK } = state.binomial;
  const prob = binomialPMF(pmfK, n, p);
  
  document.getElementById('pmf-k-display').textContent = pmfK;
  document.getElementById('pmf-result').textContent = prob.toFixed(4);
  document.getElementById('pmf-result-pct').textContent = `(${(prob * 100).toFixed(2)}%)`;
  document.getElementById('pmf-explanation').textContent = 
    `This means the probability of getting exactly ${pmfK} successes out of ${n} trials is ${prob.toFixed(4)}.`;
}

function updateBinomialCDFDisplay() {
  const { n, p, cdfK } = state.binomial;
  const probLE = binomialCDF(cdfK, n, p);
  const probGT = Math.max(0, 1 - probLE);

  document.getElementById('cdf-k-display').textContent = cdfK;
  document.getElementById('cdf-k-gt-display').textContent = cdfK;
  document.getElementById('cdf-k-gt-display2').textContent = cdfK;
  
  document.getElementById('cdf-result-le').textContent = probLE.toFixed(4);
  document.getElementById('cdf-result-le-pct').textContent = `(${(probLE * 100).toFixed(2)}%)`;
  document.getElementById('cdf-result-gt').textContent = probGT.toFixed(4);

  document.getElementById('cdf-explanation').innerHTML = 
    `&ldquo;P(X &le; ${cdfK}) means the probability of getting ${cdfK} or fewer successes.&rdquo;`;
}

// Custom plugin to draw vertical dashed reference line at Mean on Chart.js
const meanLinePlugin = {
  id: 'meanLinePlugin',
  afterDraw: (chart) => {
    if (!chart.config.options.plugins.meanLine?.display) return;
    const meanVal = chart.config.options.plugins.meanLine.value;
    const ctx = chart.ctx;
    const xAxis = chart.scales.x;
    const yAxis = chart.scales.y;

    // Interpolate x coordinate for fractional mean values
    const floorK = Math.floor(meanVal);
    const ceilK = Math.ceil(meanVal);
    const frac = meanVal - floorK;

    const xFloor = xAxis.getPixelForValue(floorK);
    const xCeil = xAxis.getPixelForValue(ceilK);
    const xPos = xFloor + (xCeil - xFloor) * frac;

    if (xPos >= xAxis.left && xPos <= xAxis.right) {
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ef4444';
      ctx.moveTo(xPos, yAxis.top);
      ctx.lineTo(xPos, yAxis.bottom);
      ctx.stroke();

      // Label at top of line
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Mean (\u03bc = ${meanVal.toFixed(2)})`, xPos, yAxis.top - 6);
      ctx.restore();
    }
  }
};

// Prompt 6: Binomial PMF Graph with Mean line & tooltips
function renderBinomialChart() {
  const canvas = document.getElementById('binomChart');
  if (!canvas) return;
  const { n, p, pmfK } = state.binomial;
  const mean = n * p;

  const labels = [];
  const data = [];
  const bgColors = [];

  for (let k = 0; k <= n; k++) {
    labels.push(k);
    const prob = binomialPMF(k, n, p);
    data.push(prob);
    bgColors.push(k === pmfK ? '#f59e0b' : '#3b82f6');
  }

  // Check if Chart.js is available
  if (typeof Chart !== 'undefined') {
    if (binomChartInstance) {
      binomChartInstance.destroy();
    }
    const ctx = canvas.getContext('2d');
    binomChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'P(X = k)',
          data: data,
          backgroundColor: bgColors,
          borderColor: bgColors.map(c => c === '#f59e0b' ? '#d97706' : '#2563eb'),
          borderWidth: 1,
          borderRadius: 3
        }]
      },
      plugins: [meanLinePlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          meanLine: { display: true, value: mean },
          tooltip: {
            callbacks: {
              title: (items) => `X = ${items[0].label}`,
              label: (item) => `P(X = ${item.label}) = ${Number(item.raw).toFixed(4)}`
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Number of Successes (X)', font: { weight: 'bold' } },
            grid: { display: false }
          },
          y: {
            title: { display: true, text: 'Probability P(X)', font: { weight: 'bold' } },
            beginAtZero: true,
            suggestedMax: Math.max(...data) * 1.25
          }
        }
      }
    });
  } else {
    // Pure canvas fallback renderer for offline environments
    drawPureCanvasBarChart(canvas, labels, data, pmfK, mean, 'Number of Successes (X)', 'Probability P(X)');
  }
}

// Pure HTML5 Canvas Fallback Renderer (Ensures 100% offline functionality)
function drawPureCanvasBarChart(canvas, labels, data, highlightK, meanVal, xLabel, yLabel) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const W = rect.width;
  const H = rect.height;
  ctx.clearRect(0, 0, W, H);

  const padLeft = 60;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 50;

  const plotW = W - padLeft - padRight;
  const plotH = H - padTop - padBottom;

  const maxVal = Math.max(0.1, Math.max(...data) * 1.2);

  // Axes
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padLeft, padTop);
  ctx.lineTo(padLeft, padTop + plotH);
  ctx.lineTo(padLeft + plotW, padTop + plotH);
  ctx.stroke();

  // Gridlines & Y-ticks
  const yTicks = 5;
  ctx.font = '10px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'right';
  for (let i = 0; i <= yTicks; i++) {
    const val = (maxVal / yTicks) * i;
    const y = padTop + plotH - (i / yTicks) * plotH;
    ctx.fillText(val.toFixed(2), padLeft - 8, y + 3);

    ctx.beginPath();
    ctx.strokeStyle = '#f1f5f9';
    ctx.moveTo(padLeft, y);
    ctx.lineTo(padLeft + plotW, y);
    ctx.stroke();
  }

  // Draw Bars
  const numBars = labels.length;
  const slotW = plotW / numBars;
  const barW = Math.max(2, slotW * 0.7);

  labels.forEach((lbl, idx) => {
    const val = data[idx];
    const barH = (val / maxVal) * plotH;
    const x = padLeft + idx * slotW + (slotW - barW) / 2;
    const y = padTop + plotH - barH;

    ctx.fillStyle = (lbl === highlightK) ? '#f59e0b' : '#3b82f6';
    ctx.fillRect(x, y, barW, barH);

    // X-labels (skip every few if too crowded)
    const step = Math.ceil(numBars / 25);
    if (idx % step === 0 || idx === numBars - 1) {
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(lbl, x + barW / 2, padTop + plotH + 16);
    }
  });

  // Vertical dashed line for Mean
  if (meanVal !== null && meanVal !== undefined) {
    const frac = meanVal / (numBars - 1);
    const meanX = padLeft + frac * plotW;
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(meanX, padTop);
    ctx.lineTo(meanX, padTop + plotH);
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Mean (\u03bc = ${meanVal.toFixed(2)})`, meanX, padTop - 6);
    ctx.restore();
  }

  // Axis Titles
  ctx.save();
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(xLabel, padLeft + plotW / 2, H - 10);

  ctx.translate(16, padTop + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(yLabel, 0, 0);
  ctx.restore();
}

// ================= POISSON DISTRIBUTION MODULE =================
function initPoissonModule() {
  const lambdaSlider = document.getElementById('poisson-lambda-slider');
  const lambdaInput = document.getElementById('poisson-lambda');
  const pmfKInput = document.getElementById('poi-pmf-k');
  const cdfKInput = document.getElementById('poi-cdf-k');

  function updateLambda(val) {
    let lam = parseFloat(val);
    const errEl = document.getElementById('poisson-lambda-err');
    if (isNaN(lam) || lam <= 0) {
      errEl.textContent = 'Lambda must be strictly positive (lambda > 0).';
      errEl.style.display = 'block';
      return;
    }
    errEl.style.display = 'none';
    state.poisson.lambda = lam;
    lambdaSlider.value = Math.min(lam, 25);
    lambdaInput.value = lam;
    document.getElementById('poisson-lambda-val').textContent = lam;
    document.getElementById('summary-lambda').textContent = lam;

    // Highlight corresponding chip if matches 2, 6, 10
    document.querySelectorAll('.preset-buttons .btn-chip').forEach(chip => {
      const isMatch = (lam === 2 && chip.textContent.includes('2')) ||
                      (lam === 6 && chip.textContent.includes('6')) ||
                      (lam === 10 && chip.textContent.includes('10'));
      chip.classList.toggle('active-chip', isMatch);
    });

    recomputePoisson();
  }

  lambdaSlider.addEventListener('input', e => updateLambda(e.target.value));
  lambdaInput.addEventListener('change', e => updateLambda(e.target.value));

  pmfKInput.addEventListener('input', e => {
    let k = parseInt(e.target.value, 10);
    if (isNaN(k) || k < 0) return;
    state.poisson.pmfK = k;
    updatePoissonPMFDisplay();
    renderPoissonChart();
  });

  cdfKInput.addEventListener('input', e => {
    let k = parseInt(e.target.value, 10);
    if (isNaN(k) || k < 0) return;
    state.poisson.cdfK = k;
    updatePoissonCDFDisplay();
  });

  recomputePoisson();
}

function setPoissonLambda(val) {
  document.getElementById('poisson-lambda').value = val;
  document.getElementById('poisson-lambda-slider').value = val;
  state.poisson.lambda = val;
  document.getElementById('poisson-lambda-val').textContent = val;
  document.getElementById('summary-lambda').textContent = val;

  document.querySelectorAll('.preset-buttons .btn-chip').forEach(chip => {
    const isMatch = (val === 2 && chip.textContent.includes('2')) ||
                    (val === 6 && chip.textContent.includes('6')) ||
                    (val === 10 && chip.textContent.includes('10'));
    chip.classList.toggle('active-chip', isMatch);
  });

  recomputePoisson();
}

function recomputePoisson() {
  const lam = state.poisson.lambda;
  const mean = lam;
  const variance = lam;
  const std = Math.sqrt(lam);
  const secondMoment = lam + Math.pow(lam, 2);
  const skewness = 1 / std;

  document.getElementById('poi-stat-mean').textContent = mean.toFixed(4);
  document.getElementById('poi-stat-var').textContent = variance.toFixed(4);
  document.getElementById('poi-stat-std').textContent = std.toFixed(4);
  document.getElementById('poi-stat-second').textContent = secondMoment.toFixed(4);
  document.getElementById('poi-stat-skew').textContent = skewness.toFixed(4);

  updatePoissonPMFDisplay();
  updatePoissonCDFDisplay();
  renderPoissonChart();
}

function updatePoissonPMFDisplay() {
  const { lambda, pmfK } = state.poisson;
  const prob = poissonPMF(pmfK, lambda);

  document.getElementById('poi-pmf-k-display').textContent = pmfK;
  document.getElementById('poi-pmf-result').textContent = prob.toFixed(4);
  document.getElementById('poi-pmf-pct').textContent = `(${(prob * 100).toFixed(2)}%)`;
  document.getElementById('poi-pmf-explanation').textContent = 
    `The probability of exactly ${pmfK} events occurring when the average rate is ${lambda} is ${prob.toFixed(4)}.`;
}

function updatePoissonCDFDisplay() {
  const { lambda, cdfK } = state.poisson;
  const probLE = poissonCDF(cdfK, lambda);
  const probGT = Math.max(0, 1 - probLE);

  document.getElementById('poi-cdf-k-display').textContent = cdfK;
  document.getElementById('poi-cdf-k-gt-display').textContent = cdfK;
  document.getElementById('poi-cdf-result-le').textContent = probLE.toFixed(4);
  document.getElementById('poi-cdf-pct').textContent = `(${(probLE * 100).toFixed(2)}%)`;
  document.getElementById('poi-cdf-result-gt').textContent = probGT.toFixed(4);
}

function renderPoissonChart() {
  const canvas = document.getElementById('poissonChart');
  if (!canvas) return;
  const { lambda, pmfK } = state.poisson;

  const maxK = Math.max(20, Math.ceil(lambda + 4 * Math.sqrt(lambda)));
  const labels = [];
  const data = [];
  const bgColors = [];

  for (let k = 0; k <= maxK; k++) {
    labels.push(k);
    const prob = poissonPMF(k, lambda);
    data.push(prob);
    bgColors.push(k === pmfK ? '#f59e0b' : '#0d9488');
  }

  if (typeof Chart !== 'undefined') {
    if (poissonChartInstance) {
      poissonChartInstance.destroy();
    }
    const ctx = canvas.getContext('2d');
    poissonChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'P(X = k)',
          data: data,
          backgroundColor: bgColors,
          borderColor: bgColors.map(c => c === '#f59e0b' ? '#d97706' : '#0f766e'),
          borderWidth: 1,
          borderRadius: 3
        }]
      },
      plugins: [meanLinePlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          meanLine: { display: true, value: lambda },
          tooltip: {
            callbacks: {
              title: (items) => `Events X = ${items[0].label}`,
              label: (item) => `P(X = ${item.label}) = ${Number(item.raw).toFixed(4)}`
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Number of Occurrences (X)', font: { weight: 'bold' } },
            grid: { display: false }
          },
          y: {
            title: { display: true, text: 'Probability P(X)', font: { weight: 'bold' } },
            beginAtZero: true
          }
        }
      }
    });
  } else {
    drawPureCanvasBarChart(canvas, labels, data, pmfK, lambda, 'Number of Occurrences (X)', 'Probability P(X)');
  }
}

// ================= GEOMETRIC DISTRIBUTION MODULE =================
function initGeometricModule() {
  const pSlider = document.getElementById('geom-p-slider');
  const pInput = document.getElementById('geom-p');

  function updateGeomP(val) {
    let p = parseFloat(val);
    if (isNaN(p) || p <= 0 || p > 1) return;
    state.geometric.p = p;
    pSlider.value = p;
    pInput.value = p;
    document.getElementById('geom-p-val').textContent = p.toFixed(2);
    recomputeGeometric();
  }

  pSlider.addEventListener('input', e => updateGeomP(e.target.value));
  pInput.addEventListener('change', e => updateGeomP(e.target.value));
  recomputeGeometric();
}

function recomputeGeometric() {
  const p = state.geometric.p;
  const mean = 1 / p;
  const variance = (1 - p) / Math.pow(p, 2);
  const std = Math.sqrt(variance);

  document.getElementById('geom-stat-mean').textContent = mean.toFixed(4);
  document.getElementById('geom-stat-var').textContent = variance.toFixed(4);
  document.getElementById('geom-stat-std').textContent = std.toFixed(4);

  renderGeometricChart();
}

function renderGeometricChart() {
  const canvas = document.getElementById('geomChart');
  if (!canvas) return;
  const p = state.geometric.p;
  const labels = [];
  const data = [];

  for (let k = 1; k <= 20; k++) {
    labels.push(k);
    data.push(geometricPMF(k, p));
  }

  if (typeof Chart !== 'undefined') {
    if (geomChartInstance) {
      geomChartInstance.destroy();
    }
    const ctx = canvas.getContext('2d');
    geomChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'P(X = k)',
          data: data,
          backgroundColor: '#8b5cf6',
          borderRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { title: { display: true, text: 'Trial of First Success (k)', font: { weight: 'bold' } } },
          y: { title: { display: true, text: 'Probability P(X)', font: { weight: 'bold' } }, beginAtZero: true }
        }
      }
    });
  } else {
    drawPureCanvasBarChart(canvas, labels, data, -1, 1 / p, 'Trial of First Success (k)', 'Probability P(X)');
  }
}

// ================= EXERCISE LOADERS =================
function loadExercise1() {
  switchTab('binomial');
  document.getElementById('binom-n').value = 15;
  document.getElementById('binom-n-slider').value = 15;
  document.getElementById('binom-p').value = 0.6;
  document.getElementById('binom-p-slider').value = 0.6;
  document.getElementById('pmf-k').value = 9;
  document.getElementById('cdf-k').value = 10;

  state.binomial.n = 15;
  state.binomial.p = 0.6;
  state.binomial.pmfK = 9;
  state.binomial.cdfK = 10;

  document.getElementById('binom-n-val').textContent = '15';
  document.getElementById('summary-n').textContent = '15';
  document.getElementById('binom-p-val').textContent = '0.60';
  document.getElementById('summary-p').textContent = '0.60';
  document.getElementById('summary-q').textContent = '0.40';

  recomputeBinomial();
}

function loadExercise2() {
  switchTab('poisson');
  setPoissonLambda(6);
  document.getElementById('poi-pmf-k').value = 8;
  document.getElementById('poi-cdf-k').value = 5;
  state.poisson.pmfK = 8;
  state.poisson.cdfK = 5;
  recomputePoisson();
}

// ================= BOOTSTRAP APP =================
document.addEventListener('DOMContentLoaded', () => {
  // Navigation tabs listener
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      switchTab(target);
    });
  });

  // Initialize modules
  initBinomialModule();
  initPoissonModule();
  initGeometricModule();

  // Resize listener for pure canvas charts if window resized
  window.addEventListener('resize', () => {
    if (state.activeTab === 'binomial') renderBinomialChart();
    if (state.activeTab === 'poisson') renderPoissonChart();
    if (state.activeTab === 'geometric') renderGeometricChart();
  });
});
