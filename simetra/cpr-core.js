// SIMETRA CPR Simulation Core
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ── RENDERER ──────────────────────────────────────────────────
const canvas = document.getElementById('cpr-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020817);
scene.fog = new THREE.FogExp2(0x020817, 0.05);

// Camera looks down at supine patient
const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 100);
camera.position.set(0, 2.8, 2.2);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.enablePan = false;
controls.minDistance = 1.5;
controls.maxDistance = 6;
controls.enabled = false;

function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

// ── LIGHTING ──────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0x10b981, 0.4));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(3, 8, 3);
dirLight.castShadow = true;
scene.add(dirLight);
const rimLight = new THREE.DirectionalLight(0x10b981, 0.6);
rimLight.position.set(-3, 2, -2);
scene.add(rimLight);
const overheadLight = new THREE.PointLight(0xffffff, 1.5, 8);
overheadLight.position.set(0, 4, 0);
scene.add(overheadLight);

// ── GRID / FLOOR ──────────────────────────────────────────────
const grid = new THREE.GridHelper(20, 40, 0x10b981, 0x0a1628);
grid.position.y = -0.8;
scene.add(grid);

// Operating table
const tableGeo = new THREE.BoxGeometry(1.0, 0.08, 2.4);
const tableMat = new THREE.MeshStandardMaterial({ color: 0x0f2a3f, roughness: 0.4, metalness: 0.6 });
const table = new THREE.Mesh(tableGeo, tableMat);
table.position.y = -0.42;
table.receiveShadow = true;
scene.add(table);

// Table legs
const legMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, metalness: 0.8, roughness: 0.2 });
[[-0.4, -0.9], [0.4, -0.9], [-0.4, 0.9], [0.4, 0.9]].forEach(([x, z]) => {
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8), legMat);
  leg.position.set(x, -0.82, z);
  scene.add(leg);
});

// ── STATE MACHINE ─────────────────────────────────────────────
const STATES = { ASSESS: 0, COMPRESS: 1, SUSTAIN: 2, OUTCOME: 3 };
let state = STATES.ASSESS;
let humanModel = null;
let stepsDone = 0;
let startTime = null;
let phaseStartTime = null;

// Compression tracking
const compressionTimes = [];
let totalCompressions = 0;
let rhythmAccuracy = 0;
let consistencyScore = 0;
let avgBPM = 0;
const TARGET_BPM_MIN = 100, TARGET_BPM_MAX = 120;
const SUSTAIN_DURATION = 30; // seconds for sustain phase
let sustainTimer = SUSTAIN_DURATION;
let sustainInterval = null;
let lastBPMUpdate = 0;

// Rhythm canvas
const rhythmCanvas = document.getElementById('rhythm-canvas');
const rhythmCtx = rhythmCanvas.getContext('2d');
const rhythmHistory = []; // stores timestamps of compressions

// ── DIALOG CONFIGS ────────────────────────────────────────────
const DIALOGS = [
  {
    tag: 'STEP 1 / 4 — CPR PROTOCOL',
    title: 'ASSESS PATIENT',
    sub: 'Check Responsiveness',
    body: 'The patient is unresponsive and not breathing normally. You must quickly assess the situation. Tap the patient to check for responsiveness. Do not waste time — every second without circulation causes brain damage.',
    metrics: [
      { val: 'FAST', label: 'Priority' },
      { val: '1×', label: 'Action' },
      { val: 'CRITICAL', label: 'Status' }
    ],
    btn: 'BEGIN ASSESSMENT →'
  },
  {
    tag: 'STEP 2 / 4 — CPR PROTOCOL',
    title: 'BEGIN COMPRESSIONS',
    sub: 'Chest Compression Phase',
    body: 'Place hands on the center of the chest. Push hard and fast — aim for 100 to 120 compressions per minute. The system will track your BPM in real time. Too slow or too fast will reduce your score.',
    metrics: [
      { val: '100–120', label: 'Target BPM' },
      { val: '5–6 cm', label: 'Depth' },
      { val: '30×', label: 'First Cycle' }
    ],
    btn: 'START COMPRESSIONS →'
  },
  {
    tag: 'STEP 3 / 4 — CPR PROTOCOL',
    title: 'MAINTAIN RHYTHM',
    sub: 'Sustained Compression Cycle',
    body: 'Maintain the compression rhythm for 30 seconds. Consistency is critical — irregular rhythm reduces blood flow effectiveness. Keep your BPM in the green zone. The timer is counting.',
    metrics: [
      { val: '30s', label: 'Duration' },
      { val: 'STEADY', label: 'Rhythm' },
      { val: 'MAX', label: 'Effort' }
    ],
    btn: 'MAINTAIN RHYTHM →'
  },
  {
    tag: 'STEP 4 / 4 — CPR PROTOCOL',
    title: 'OUTCOME',
    sub: 'Evaluating Performance',
    body: 'Compression cycle complete. The system is evaluating your compression rate, rhythm accuracy, and consistency. Results are being compiled.',
    metrics: [
      { val: '--', label: 'Avg BPM' },
      { val: '--', label: 'Rhythm Acc.' },
      { val: '--', label: 'Compressions' }
    ],
    btn: 'VIEW RESULTS →'
  }
];

// ── DIALOG LOGIC ──────────────────────────────────────────────
function showDialog(stepIdx, onConfirm) {
  const d = DIALOGS[stepIdx];
  document.getElementById('d-tag').textContent = d.tag;
  document.getElementById('d-title').textContent = d.title;
  document.getElementById('d-sub').textContent = d.sub;
  document.getElementById('d-body').textContent = d.body;
  document.getElementById('dialog-btn').textContent = d.btn;

  const metricsEl = document.getElementById('d-metrics');
  metricsEl.innerHTML = d.metrics.map(m =>
    `<div class="d-metric"><div class="d-metric-val">${m.val}</div><div class="d-metric-label">${m.label}</div></div>`
  ).join('');

  const dialog = document.getElementById('dialog');
  dialog.style.display = 'flex';

  const btn = document.getElementById('dialog-btn');
  btn.onclick = () => {
    dialog.style.display = 'none';
    onConfirm();
  };
}

function hideDialog() {
  document.getElementById('dialog').style.display = 'none';
}

// ── STEP RUNNERS ──────────────────────────────────────────────
function runAssess() {
  state = STATES.ASSESS;
  setStep('STEP 1 / 4', 'ASSESS PATIENT', 'Click the patient to check responsiveness');
  setInstr('CLICK THE PATIENT TO CHECK RESPONSIVENESS');
  document.getElementById('s-phase').textContent = 'ASSESS';
  phaseStartTime = Date.now();

  // Make canvas clickable for assess
  canvas.onclick = () => {
    canvas.onclick = null;
    const elapsed = ((Date.now() - phaseStartTime) / 1000).toFixed(1);
    const fast = parseFloat(elapsed) < 3;
    showFeedback(fast ? 'PATIENT ASSESSED — RESPONSE CONFIRMED' : `ASSESSED IN ${elapsed}s — FASTER NEXT TIME`, fast ? 'success' : 'warn');
    speak(fast ? 'Patient assessed. No response detected. Begin compressions immediately.' : 'Patient assessed. Initiate compressions now.');
    // Flash patient
    if (humanModel) {
      humanModel.traverse(c => {
        if (c.isMesh) { c.material.emissive = new THREE.Color(0x10b981); c.material.emissiveIntensity = 0.5; }
      });
      setTimeout(() => {
        humanModel.traverse(c => {
          if (c.isMesh) { c.material.emissiveIntensity = 0; }
        });
      }, 600);
    }
    stepsDone++;
    updateProgressUI();
    setTimeout(() => showDialog(1, runCompress), 1500);
  };
}

function runCompress() {
  state = STATES.COMPRESS;
  setStep('STEP 2 / 4', 'BEGIN COMPRESSIONS', 'Click or press SPACE at 100–120 BPM rhythm');
  setInstr('CLICK OR PRESS SPACEBAR — MAINTAIN 100–120 BPM');
  document.getElementById('s-phase').textContent = 'COMPRESS';
  document.getElementById('comp-target').style.display = 'flex';
  phaseStartTime = Date.now();
  compressionTimes.length = 0;
  totalCompressions = 0;

  // After 30 compressions advance
  const checkAdvance = () => {
    if (totalCompressions >= 30) {
      stepsDone++;
      updateProgressUI();
      speak('Good. Thirty compressions complete. Maintain the rhythm.');
      setTimeout(() => showDialog(2, runSustain), 1200);
    }
  };
  window._compressCheck = checkAdvance;
}

function runSustain() {
  state = STATES.SUSTAIN;
  setStep('STEP 3 / 4', 'MAINTAIN RHYTHM', `Keep compressing for ${SUSTAIN_DURATION} seconds`);
  setInstr('MAINTAIN RHYTHM — KEEP BPM IN GREEN ZONE');
  document.getElementById('s-phase').textContent = 'SUSTAIN';
  phaseStartTime = Date.now();
  sustainTimer = SUSTAIN_DURATION;
  updateTimerSub(`${SUSTAIN_DURATION}s REMAINING`);

  sustainInterval = setInterval(() => {
    sustainTimer--;
    updateTimerSub(`${sustainTimer}s REMAINING`);
    if (sustainTimer <= 10) {
      showFeedback(`${sustainTimer}s REMAINING — KEEP GOING`, sustainTimer <= 5 ? 'warn' : '');
    }
    if (sustainTimer <= 0) {
      clearInterval(sustainInterval);
      stepsDone++;
      updateProgressUI();
      speak('Compression cycle complete. Evaluating performance.');
      finishProcedure();
    }
  }, 1000);
}

function finishProcedure() {
  state = STATES.OUTCOME;
  document.getElementById('comp-target').style.display = 'none';
  setStep('COMPLETE ✓', 'PROCEDURE DONE', 'CPR cycle complete');
  setInstr('PROCEDURE COMPLETE — LOADING RESULTS');
  document.getElementById('s-phase').textContent = 'COMPLETE';

  // Calculate final scores
  avgBPM = calcAvgBPM();
  rhythmAccuracy = calcRhythmAccuracy();
  consistencyScore = calcConsistency();
  const grade = calcGrade(rhythmAccuracy);

  // Update outcome dialog metrics
  document.getElementById('d-metrics').innerHTML = `
    <div class="d-metric"><div class="d-metric-val">${avgBPM}</div><div class="d-metric-label">Avg BPM</div></div>
    <div class="d-metric"><div class="d-metric-val">${rhythmAccuracy}%</div><div class="d-metric-label">Rhythm Acc.</div></div>
    <div class="d-metric"><div class="d-metric-val">${totalCompressions}</div><div class="d-metric-label">Compressions</div></div>
  `;

  // Save to sessionStorage
  const perfData = {
    procedure: 'CPR',
    avgBPM, rhythmAccuracy, consistencyScore,
    totalCompressions, grade,
    time: Math.round((Date.now() - startTime) / 1000),
    accuracy: rhythmAccuracy,
    steps: [{ step: 'cpr_full', accuracy: rhythmAccuracy, bpm: avgBPM }],
    mistakes: avgBPM < TARGET_BPM_MIN || avgBPM > TARGET_BPM_MAX ? 1 : 0
  };
  sessionStorage.setItem('simResults', JSON.stringify(perfData));

  setTimeout(() => showOutcome(grade, avgBPM, rhythmAccuracy, totalCompressions), 800);
}

function showOutcome(grade, bpm, rhythm, compressions) {
  document.getElementById('outcome-grade').textContent = grade;
  document.getElementById('o-bpm').textContent = bpm;
  document.getElementById('o-rhythm').textContent = rhythm + '%';
  document.getElementById('o-compressions').textContent = compressions;

  const feedback = generateFeedback(bpm, rhythm, compressions);
  document.getElementById('outcome-feedback').innerHTML = feedback;

  // Grade color
  const gradeEl = document.getElementById('outcome-grade');
  if (grade === 'A') gradeEl.style.color = '#10b981';
  else if (grade === 'B') gradeEl.style.color = '#0891b2';
  else if (grade === 'C') gradeEl.style.color = '#f59e0b';
  else gradeEl.style.color = '#ef4444';

  document.getElementById('outcome').style.display = 'flex';
  speak(`Procedure complete. Grade ${grade}. ${feedback.replace(/<[^>]+>/g, '')}`);
}

// ── COMPRESSION HANDLER ───────────────────────────────────────
function handleCompression() {
  if (state !== STATES.COMPRESS && state !== STATES.SUSTAIN) return;
  const now = Date.now();
  compressionTimes.push(now);
  totalCompressions++;
  rhythmHistory.push(now);
  if (rhythmHistory.length > 30) rhythmHistory.shift();

  // Visual feedback on button
  const btn = document.getElementById('comp-btn');
  btn.classList.add('pressed');
  setTimeout(() => btn.classList.remove('pressed'), 80);

  // Compress patient model
  if (humanModel) {
    humanModel.traverse(c => {
      if (c.isMesh) { c.material.emissiveIntensity = 0.3; }
    });
    setTimeout(() => {
      humanModel.traverse(c => { if (c.isMesh) c.material.emissiveIntensity = 0; });
    }, 100);
  }

  // Update compression count
  document.getElementById('comp-val').textContent = totalCompressions;

  // Calculate live BPM from last few compressions
  if (compressionTimes.length >= 2) {
    const recent = compressionTimes.slice(-6);
    const intervals = [];
    for (let i = 1; i < recent.length; i++) intervals.push(recent[i] - recent[i - 1]);
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const liveBPM = Math.round(60000 / avgInterval);
    updateBPMDisplay(liveBPM);
    lastBPMUpdate = now;
  }

  // Check advance for compress phase
  if (state === STATES.COMPRESS && window._compressCheck) window._compressCheck();
}

// ── BPM DISPLAY ───────────────────────────────────────────────
function updateBPMDisplay(bpm) {
  const el = document.getElementById('bpm-val');
  const statusEl = document.getElementById('bpm-status');
  const barEl = document.getElementById('bpm-bar');

  el.textContent = bpm;
  const pct = Math.min(Math.max((bpm - 60) / (160 - 60) * 100, 0), 100);
  barEl.style.width = pct + '%';

  if (bpm < TARGET_BPM_MIN) {
    el.className = 'warn';
    statusEl.textContent = '⚠ TOO SLOW';
    barEl.style.background = '#f59e0b';
    if (bpm < 80) showFeedback('TOO SLOW — INCREASE RATE', 'warn');
  } else if (bpm > TARGET_BPM_MAX) {
    el.className = 'danger';
    statusEl.textContent = '⚠ TOO FAST';
    barEl.style.background = '#ef4444';
    if (bpm > 140) showFeedback('TOO FAST — SLOW DOWN', 'error');
  } else {
    el.className = '';
    statusEl.textContent = '✓ OPTIMAL RATE';
    barEl.style.background = '#10b981';
  }

  // Rhythm accuracy
  const acc = calcRhythmAccuracy();
  document.getElementById('t-rhythm').textContent = acc + '%';
  document.getElementById('t-consist').textContent = calcConsistency() + '%';
}

// ── SCORING ───────────────────────────────────────────────────
function calcAvgBPM() {
  if (compressionTimes.length < 2) return 0;
  const intervals = [];
  for (let i = 1; i < compressionTimes.length; i++) intervals.push(compressionTimes[i] - compressionTimes[i - 1]);
  const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  return Math.round(60000 / avg);
}

function calcRhythmAccuracy() {
  if (compressionTimes.length < 4) return 0;
  const intervals = [];
  for (let i = 1; i < compressionTimes.length; i++) intervals.push(compressionTimes[i] - compressionTimes[i - 1]);
  const targetInterval = 60000 / 110; // 110 BPM ideal
  const scores = intervals.map(iv => {
    const dev = Math.abs(iv - targetInterval) / targetInterval;
    return Math.max(0, 1 - dev * 2);
  });
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 100);
}

function calcConsistency() {
  if (compressionTimes.length < 4) return 0;
  const intervals = [];
  for (let i = 1; i < compressionTimes.length; i++) intervals.push(compressionTimes[i] - compressionTimes[i - 1]);
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean; // coefficient of variation
  return Math.round(Math.max(0, 1 - cv * 3) * 100);
}

function calcGrade(rhythmAcc) {
  if (rhythmAcc >= 85) return 'A';
  if (rhythmAcc >= 70) return 'B';
  if (rhythmAcc >= 50) return 'C';
  return 'D';
}

function generateFeedback(bpm, rhythm, compressions) {
  const lines = [];
  if (bpm >= TARGET_BPM_MIN && bpm <= TARGET_BPM_MAX) {
    lines.push(`<strong style="color:#10b981">✓ Compression rate:</strong> ${bpm} BPM — within optimal range.`);
  } else if (bpm < TARGET_BPM_MIN) {
    lines.push(`<strong style="color:#f59e0b">⚠ Compression rate:</strong> ${bpm} BPM — too slow. Target 100–120 BPM.`);
  } else {
    lines.push(`<strong style="color:#ef4444">✗ Compression rate:</strong> ${bpm} BPM — too fast. Reduce pace.`);
  }
  if (rhythm >= 80) lines.push(`<strong style="color:#10b981">✓ Rhythm accuracy:</strong> ${rhythm}% — excellent consistency.`);
  else if (rhythm >= 60) lines.push(`<strong style="color:#f59e0b">⚠ Rhythm accuracy:</strong> ${rhythm}% — improve timing regularity.`);
  else lines.push(`<strong style="color:#ef4444">✗ Rhythm accuracy:</strong> ${rhythm}% — highly irregular. Practice metronome timing.`);
  lines.push(`<strong style="color:#10b981">Total compressions:</strong> ${compressions}`);
  return lines.join('<br/>');
}

// ── RHYTHM VISUALIZER ─────────────────────────────────────────
function drawRhythm() {
  const w = rhythmCanvas.width = rhythmCanvas.offsetWidth;
  const h = 40;
  rhythmCtx.clearRect(0, 0, w, h);
  const now = Date.now();
  const window2 = 6000; // show last 6 seconds

  // Draw baseline
  rhythmCtx.strokeStyle = 'rgba(16,185,129,0.15)';
  rhythmCtx.lineWidth = 1;
  rhythmCtx.beginPath(); rhythmCtx.moveTo(0, h / 2); rhythmCtx.lineTo(w, h / 2); rhythmCtx.stroke();

  // Draw target zone lines
  const targetY1 = h * 0.2, targetY2 = h * 0.8;
  rhythmCtx.strokeStyle = 'rgba(16,185,129,0.1)';
  rhythmCtx.setLineDash([4, 4]);
  rhythmCtx.beginPath(); rhythmCtx.moveTo(0, targetY1); rhythmCtx.lineTo(w, targetY1); rhythmCtx.stroke();
  rhythmCtx.beginPath(); rhythmCtx.moveTo(0, targetY2); rhythmCtx.lineTo(w, targetY2); rhythmCtx.stroke();
  rhythmCtx.setLineDash([]);

  // Draw compression spikes
  rhythmHistory.forEach(t => {
    const age = now - t;
    if (age > window2) return;
    const x = w - (age / window2) * w;
    const alpha = 1 - age / window2;
    rhythmCtx.shadowColor = '#10b981';
    rhythmCtx.shadowBlur = 6;
    rhythmCtx.strokeStyle = `rgba(16,185,129,${alpha})`;
    rhythmCtx.lineWidth = 2;
    rhythmCtx.beginPath();
    rhythmCtx.moveTo(x, h * 0.7);
    rhythmCtx.lineTo(x, h * 0.05);
    rhythmCtx.lineTo(x + 4, h * 0.4);
    rhythmCtx.lineTo(x + 8, h * 0.7);
    rhythmCtx.stroke();
    rhythmCtx.shadowBlur = 0;
  });

  // Fade indicator if no recent compression
  if (compressionTimes.length > 0) {
    const lastComp = compressionTimes[compressionTimes.length - 1];
    const idle = now - lastComp;
    if (idle > 2000 && (state === STATES.COMPRESS || state === STATES.SUSTAIN)) {
      rhythmCtx.fillStyle = `rgba(239,68,68,${Math.min(idle / 3000, 0.6)})`;
      rhythmCtx.font = '700 9px Space Grotesk, sans-serif';
      rhythmCtx.textAlign = 'center';
      rhythmCtx.fillText('NO COMPRESSION DETECTED', w / 2, h / 2 + 4);
    }
  }
}

// ── LOAD MODEL ────────────────────────────────────────────────
const loader = new GLTFLoader();

function loadPatient() {
  setLoadProg(20);
  const paths = ['models/human.glb', '../aserts/models/human.glb'];
  tryLoad(paths, 0, (gltf) => {
    humanModel = gltf.scene;
    // Lay patient flat (supine) — rotate 90° on X
    humanModel.rotation.x = -Math.PI / 2;
    humanModel.rotation.z = Math.PI; // face up
    scene.add(humanModel);
    humanModel.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(humanModel);
    const size = box.getSize(new THREE.Vector3());
    const scale = 1.8 / Math.max(size.x, size.z); // scale by width since lying flat
    humanModel.scale.setScalar(scale);
    humanModel.updateMatrixWorld(true);

    const box2 = new THREE.Box3().setFromObject(humanModel);
    const center2 = box2.getCenter(new THREE.Vector3());
    humanModel.position.set(-center2.x, -box2.min.y - 0.38, -center2.z);

    humanModel.traverse(c => {
      if (c.isMesh) {
        c.castShadow = true; c.receiveShadow = true;
        const mats = Array.isArray(c.material) ? c.material : [c.material];
        mats.forEach(m => { m.transparent = true; m.opacity = 1; });
      }
    });

    setLoadProg(90);
    setTimeout(hideLoading, 500);
    speak('CPR simulation loaded. Step one: assess the patient. Click the patient to check responsiveness.');
  }, buildPatientFallback);
}

function buildPatientFallback() {
  humanModel = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x1a3a5c, roughness: 0.6, metalness: 0.1 });
  // Torso (lying flat)
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.7, 8, 16), mat);
  torso.rotation.z = Math.PI / 2;
  humanModel.add(torso);
  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), mat);
  head.position.set(0.72, 0, 0);
  humanModel.add(head);
  // Legs
  const legMat = mat.clone();
  const lLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.6, 6, 8), legMat);
  lLeg.rotation.z = Math.PI / 2; lLeg.position.set(-0.9, 0.15, 0); humanModel.add(lLeg);
  const rLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.6, 6, 8), legMat);
  rLeg.rotation.z = Math.PI / 2; rLeg.position.set(-0.9, -0.15, 0); humanModel.add(rLeg);
  // Chest compression marker
  const marker = new THREE.Mesh(
    new THREE.CircleGeometry(0.08, 16),
    new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide })
  );
  marker.position.set(0.05, 0, 0.29);
  marker.rotation.x = -Math.PI / 2;
  humanModel.add(marker);

  scene.add(humanModel);
  hideLoading();
  speak('CPR simulation ready. Click the patient to assess.');
}

function tryLoad(paths, idx, onSuccess, onFail) {
  if (idx >= paths.length) { onFail(); return; }
  loader.load(paths[idx],
    gltf => onSuccess(gltf),
    xhr => { if (xhr.total) setLoadProg(20 + (xhr.loaded / xhr.total) * 60); },
    () => tryLoad(paths, idx + 1, onSuccess, onFail)
  );
}

// ── ANIMATION LOOP ────────────────────────────────────────────
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  controls.update();

  // Subtle patient breathing animation
  if (humanModel && state === STATES.ASSESS) {
    humanModel.scale.y = humanModel.scale.y; // keep flat
    const breathe = 1 + Math.sin(t * 1.2) * 0.008;
    humanModel.scale.setScalar(humanModel.scale.x * breathe / humanModel.scale.x * humanModel.scale.x);
  }

  // BPM decay — if no compression for 2s, show idle
  if ((state === STATES.COMPRESS || state === STATES.SUSTAIN) && Date.now() - lastBPMUpdate > 2000 && lastBPMUpdate > 0) {
    document.getElementById('bpm-val').textContent = '--';
    document.getElementById('bpm-status').textContent = 'WAITING...';
    document.getElementById('bpm-bar').style.width = '0%';
  }

  // Update global timer
  if (startTime) {
    const s = Math.round((Date.now() - startTime) / 1000);
    const m = Math.floor(s / 60), sec = String(s % 60).padStart(2, '0');
    document.getElementById('s-time').textContent = `${m}:${sec}`;
    document.getElementById('timer-val').textContent = `${m}:${sec}`;
  }

  drawRhythm();
  renderer.render(scene, camera);
}

// ── INPUT ─────────────────────────────────────────────────────
document.getElementById('comp-btn').addEventListener('mousedown', handleCompression);
document.getElementById('comp-btn').addEventListener('touchstart', e => { e.preventDefault(); handleCompression(); }, { passive: false });
document.addEventListener('keydown', e => {
  if (e.code === 'Space') { e.preventDefault(); handleCompression(); }
});

// ── UI HELPERS ────────────────────────────────────────────────
function setStep(label, title, hint) {
  document.getElementById('step-label').textContent = label;
  document.getElementById('step-title').textContent = title;
  document.getElementById('step-hint').textContent = hint;
  document.getElementById('s-steps').textContent = stepsDone + ' / 4';
}
function setInstr(t) { document.getElementById('instruction-box').textContent = t; }
function updateTimerSub(t) { document.getElementById('timer-sub').textContent = t; }
function showFeedback(msg, type = '') {
  const el = document.getElementById('feedback');
  el.textContent = msg; el.className = type; el.style.opacity = '1';
  setTimeout(() => el.style.opacity = '0', 2500);
}
function updateProgressUI() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById('dot-' + i), lbl = document.getElementById('lbl-' + i);
    if (i < stepsDone) { dot.className = 'prog-dot done'; lbl.className = 'prog-label'; }
    else if (i === stepsDone) { dot.className = 'prog-dot active'; lbl.className = 'prog-label active'; }
    else { dot.className = 'prog-dot'; lbl.className = 'prog-label'; }
    if (i < 3) document.getElementById('line-' + i).className = 'prog-line' + (i < stepsDone ? ' done' : '');
  }
}
function setLoadProg(p) { document.getElementById('loading-bar').style.width = p + '%'; }
function hideLoading() {
  setLoadProg(100);
  setTimeout(() => {
    const ol = document.getElementById('loading-overlay');
    ol.style.opacity = '0';
    setTimeout(() => ol.style.display = 'none', 700);
  }, 400);
}
function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.92; u.pitch = 0.88; u.volume = 0.9;
  const voices = window.speechSynthesis.getVoices();
  const v = voices.find(v => /Google|Daniel|Alex|Samantha/i.test(v.name));
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

// ── INIT ──────────────────────────────────────────────────────
loadPatient();
animate();

// Show first dialog after loading
setTimeout(() => {
  showDialog(0, () => {
    startTime = Date.now();
    runAssess();
  });
}, 1200);
