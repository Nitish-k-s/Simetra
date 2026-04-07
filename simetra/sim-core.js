// SIMETRA Simulation Core — Three.js + State Machine
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ── RENDERER ──────────────────────────────────────────────────
const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020817);
scene.fog = new THREE.FogExp2(0x020817, 0.06);

const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 100);
camera.position.set(0, 0, 2.6);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.enablePan = false;
controls.minDistance = 1.0;
controls.maxDistance = 4.0;
controls.maxPolarAngle = Math.PI * 0.78;
controls.enabled = false;
controls.target.set(0, 0, 0); // aim at chest

function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

// ── LIGHTING ──────────────────────────────────────────────────
const ambient = new THREE.AmbientLight(0x0891b2, 0.5);
scene.add(ambient);
const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
dirLight.position.set(4, 6, 4);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
scene.add(dirLight);
const rimLight = new THREE.DirectionalLight(0x0891b2, 0.8);
rimLight.position.set(-4, 2, -4);
scene.add(rimLight);
const fillLight = new THREE.PointLight(0x06b6d4, 2.0, 8);
fillLight.position.set(0, 3, 2);
scene.add(fillLight);
const bottomLight = new THREE.PointLight(0x0891b2, 0.6, 5);
bottomLight.position.set(0, -2, 0);
scene.add(bottomLight);

// ── GRID FLOOR ────────────────────────────────────────────────
const gridHelper = new THREE.GridHelper(30, 60, 0x0891b2, 0x0a1628);
gridHelper.position.y = -2.2;
scene.add(gridHelper);

// Second finer grid
const gridHelper2 = new THREE.GridHelper(30, 120, 0x0f2a3f, 0x0a1628);
gridHelper2.position.y = -2.19;
scene.add(gridHelper2);

// ── PARTICLE SYSTEM ───────────────────────────────────────────
const pCanvas = document.getElementById('particle-canvas');
const pCtx = pCanvas.getContext('2d');
function resizePCanvas() { pCanvas.width = pCanvas.offsetWidth; pCanvas.height = pCanvas.offsetHeight; }
window.addEventListener('resize', resizePCanvas);
resizePCanvas();

const particles = Array.from({ length: 60 }, () => ({
  x: Math.random() * pCanvas.width,
  y: Math.random() * pCanvas.height,
  r: Math.random() * 1.5 + 0.3,
  vx: (Math.random() - 0.5) * 0.3,
  vy: -Math.random() * 0.4 - 0.1,
  alpha: Math.random() * 0.5 + 0.1
}));

function drawParticles() {
  pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.y < 0) { p.y = pCanvas.height; p.x = Math.random() * pCanvas.width; }
    pCtx.beginPath();
    pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    pCtx.fillStyle = `rgba(8,145,178,${p.alpha})`;
    pCtx.fill();
  });
}

// ── ECG ANIMATION ─────────────────────────────────────────────
const ecgCanvas = document.getElementById('ecg-canvas');
const ecgCtx = ecgCanvas.getContext('2d');
let ecgOffset = 0;
function drawECG() {
  ecgCtx.clearRect(0, 0, ecgCanvas.width, ecgCanvas.height);
  ecgCtx.strokeStyle = '#0891b2';
  ecgCtx.lineWidth = 1.5;
  ecgCtx.shadowColor = '#0891b2';
  ecgCtx.shadowBlur = 4;
  ecgCtx.beginPath();
  for (let x = 0; x < ecgCanvas.width; x++) {
    const t = (x + ecgOffset) * 0.08;
    let y = 16;
    // QRS complex pattern
    const phase = t % (Math.PI * 2);
    if (phase < 0.3) y = 16 - Math.sin(phase * 10) * 2;
    else if (phase < 0.5) y = 16 - Math.sin((phase - 0.3) * 30) * 12;
    else if (phase < 0.7) y = 16 + Math.sin((phase - 0.5) * 15) * 5;
    else y = 16 - Math.sin((phase - 0.7) * 8) * 3;
    if (x === 0) ecgCtx.moveTo(x, y); else ecgCtx.lineTo(x, y);
  }
  ecgCtx.stroke();
  ecgCtx.shadowBlur = 0;
  ecgOffset += 2;
}

// ── INCISION CANVAS ───────────────────────────────────────────
const iCanvas = document.getElementById('incision-canvas');
const iCtx = iCanvas.getContext('2d');
function resizeICanvas() { iCanvas.width = iCanvas.offsetWidth; iCanvas.height = iCanvas.offsetHeight; }
window.addEventListener('resize', () => { resizeICanvas(); if (state === STATES.INCISION) drawGuideLine(); });
resizeICanvas();

let drawing = false, incisionPoints = [];

function drawGuideLine() {
  iCtx.clearRect(0, 0, iCanvas.width, iCanvas.height);
  // Chest is at screen center since camera targets Y=0
  const cx = iCanvas.width / 2;
  const cy = iCanvas.height / 2;
  const w = iCanvas.width * 0.14; // tight span across sternum

  // Glow outer
  iCtx.shadowColor = '#0891b2';
  iCtx.shadowBlur = 18;
  iCtx.strokeStyle = 'rgba(8,145,178,0.18)';
  iCtx.lineWidth = 8;
  iCtx.setLineDash([]);
  iCtx.beginPath(); iCtx.moveTo(cx - w, cy); iCtx.lineTo(cx + w, cy); iCtx.stroke();

  // Main dashed line
  iCtx.shadowBlur = 10;
  iCtx.strokeStyle = 'rgba(8,145,178,0.7)';
  iCtx.lineWidth = 2;
  iCtx.setLineDash([10, 6]);
  iCtx.beginPath(); iCtx.moveTo(cx - w, cy); iCtx.lineTo(cx + w, cy); iCtx.stroke();
  iCtx.setLineDash([]);

  // Endpoint markers
  [[cx - w, cy], [cx + w, cy]].forEach(([x, y]) => {
    iCtx.shadowBlur = 12;
    iCtx.fillStyle = '#0891b2';
    iCtx.beginPath(); iCtx.arc(x, y, 5, 0, Math.PI * 2); iCtx.fill();
    iCtx.strokeStyle = 'rgba(8,145,178,0.4)';
    iCtx.lineWidth = 1;
    iCtx.beginPath(); iCtx.arc(x, y, 10, 0, Math.PI * 2); iCtx.stroke();
  });

  // Label
  iCtx.shadowBlur = 0;
  iCtx.fillStyle = 'rgba(8,145,178,0.6)';
  iCtx.font = '700 9px Space Grotesk, sans-serif';
  iCtx.letterSpacing = '0.2em';
  iCtx.textAlign = 'center';
  iCtx.fillText('INCISION PATH — DRAG HERE', cx, cy - 16);

  // Tick marks
  for (let i = -3; i <= 3; i++) {
    const tx = cx + (i * w / 3.5);
    iCtx.strokeStyle = 'rgba(8,145,178,0.35)';
    iCtx.lineWidth = 1;
    iCtx.beginPath(); iCtx.moveTo(tx, cy - 6); iCtx.lineTo(tx, cy + 6); iCtx.stroke();
  }
}

function drawIncisionStroke(points) {
  if (points.length < 2) return;
  iCtx.clearRect(0, 0, iCanvas.width, iCanvas.height);
  // Glow layer
  iCtx.shadowColor = '#0891b2';
  iCtx.shadowBlur = 20;
  iCtx.strokeStyle = 'rgba(8,145,178,0.3)';
  iCtx.lineWidth = 10;
  iCtx.lineCap = 'round'; iCtx.lineJoin = 'round';
  iCtx.beginPath(); iCtx.moveTo(points[0].x, points[0].y);
  points.forEach(p => iCtx.lineTo(p.x, p.y)); iCtx.stroke();
  // Core line
  iCtx.shadowBlur = 8;
  iCtx.strokeStyle = '#0891b2';
  iCtx.lineWidth = 2.5;
  iCtx.beginPath(); iCtx.moveTo(points[0].x, points[0].y);
  points.forEach(p => iCtx.lineTo(p.x, p.y)); iCtx.stroke();
  iCtx.shadowBlur = 0;
}

function calcAccuracy(points) {
  if (points.length < 2) return 0;
  const targetY = iCanvas.height * 0.50; // center = chest
  const avgDev = points.reduce((s, p) => s + Math.abs(p.y - targetY), 0) / points.length;
  const span = points[points.length - 1].x - points[0].x;
  const spanScore = Math.min(span / (iCanvas.width * 0.4), 1);
  const devScore = Math.max(0, 1 - avgDev / (iCanvas.height * 0.07));
  return Math.round((devScore * 0.75 + spanScore * 0.25) * 100);
}

// ── STATE MACHINE ─────────────────────────────────────────────
const STATES = { INCISION: 0, OPEN_CHEST: 1, HEART_VIEW: 2, ABLATION: 3, COMPLETE: 4 };
let state = STATES.INCISION;
let humanModel = null, heartModel = null, faultyNode = null;
let ablationProgress = 0, ablating = false, ablateInterval = null, ablateHoldStart = null;
let stepsDone = 0, startTime = Date.now();
let totalAcc = 0, accCount = 0;
const perfData = { steps: [], mistakes: 0, accuracy: 0, time: 0 };

// ── MOUSE EVENTS ──────────────────────────────────────────────
canvas.addEventListener('mousedown', onDown);
canvas.addEventListener('mousemove', onMove);
canvas.addEventListener('mouseup', onUp);
canvas.addEventListener('mouseleave', onUp);
canvas.addEventListener('touchstart', e => { e.preventDefault(); onDown(e.touches[0]); }, { passive: false });
canvas.addEventListener('touchmove', e => { e.preventDefault(); onMove(e.touches[0]); }, { passive: false });
canvas.addEventListener('touchend', e => { e.preventDefault(); onUp(); }, { passive: false });

function getPos(e) {
  const r = canvas.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function onDown(e) {
  if (state === STATES.INCISION) { drawing = true; incisionPoints = [getPos(e)]; }
  if (state === STATES.OPEN_CHEST) triggerOpen();
  if (state === STATES.ABLATION) startAblation(e);
}
function onMove(e) {
  if (state === STATES.INCISION && drawing) { incisionPoints.push(getPos(e)); drawIncisionStroke(incisionPoints); }
}
function onUp() {
  if (state === STATES.INCISION && drawing) {
    drawing = false;
    if (incisionPoints.length > 8) {
      const acc = calcAccuracy(incisionPoints);
      updateAccDisplay(acc);
      if (acc >= 38) {
        perfData.steps.push({ step: 'incision', accuracy: acc, time: elapsed() });
        showFeedback(acc >= 72 ? `PRECISE INCISION — ${acc}% ACCURACY` : `INCISION COMPLETE — ${acc}%`, acc >= 72 ? 'success' : '');
        speak(acc >= 72 ? 'Excellent incision. Precision confirmed. Proceed.' : 'Incision complete. Proceed to open chest.');
        setTimeout(advanceState, 1800);
      } else {
        perfData.mistakes++;
        showFeedback('INCISION OFF TARGET — FOLLOW THE GUIDE LINE', 'error');
        speak('Incision off target. Follow the cyan guide line.');
        setTimeout(() => { iCtx.clearRect(0, 0, iCanvas.width, iCanvas.height); drawGuideLine(); }, 1600);
      }
    }
  }
}

// ── OPEN CHEST ────────────────────────────────────────────────
function triggerOpen() {
  perfData.steps.push({ step: 'open_chest', time: elapsed() });
  showFeedback('CHEST OPENED — ACCESSING CARDIAC CAVITY', 'success');
  speak('Chest opened. Accessing cardiac cavity. Prepare for heart view.');
  if (humanModel) {
    let t = 0;
    const iv = setInterval(() => {
      t += 0.05;
      humanModel.scale.y = Math.max(0, 1 - t);
      humanModel.traverse(c => { if (c.isMesh && c.material) { if (!Array.isArray(c.material)) { c.material.transparent = true; c.material.opacity = Math.max(0, 1 - t * 1.5); } } });
      if (t >= 1) { clearInterval(iv); scene.remove(humanModel); humanModel = null; setTimeout(advanceState, 300); }
    }, 30);
  } else setTimeout(advanceState, 800);
}

// ── ABLATION ──────────────────────────────────────────────────
function startAblation(e) {
  if (!faultyNode) return;
  const mouse = new THREE.Vector2();
  const r = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - r.left) / canvas.clientWidth) * 2 - 1;
  mouse.y = -((e.clientY - r.top) / canvas.clientHeight) * 2 + 1;
  const ray = new THREE.Raycaster();
  ray.setFromCamera(mouse, camera);
  const hits = ray.intersectObject(faultyNode, true);
  if (hits.length > 0) {
    ablating = true; ablateHoldStart = Date.now(); ablationProgress = 0;
    canvas.style.cursor = 'progress';
    document.getElementById('ablate-ring').style.display = 'flex';
    ablateInterval = setInterval(() => {
      ablationProgress = Math.min(100, ablationProgress + 3.5);
      const dash = (ablationProgress / 100) * 163;
      document.getElementById('ablate-circle').setAttribute('stroke-dasharray', `${dash} 163`);
      document.getElementById('ablate-pct').textContent = Math.round(ablationProgress) + '%';
      if (faultyNode) { faultyNode.material.emissiveIntensity = 1 + ablationProgress / 40; faultyNode.scale.setScalar(1 + Math.sin(ablationProgress * 0.15) * 0.08); }
      if (ablationProgress >= 100) { clearInterval(ablateInterval); finishAblation(); }
    }, 60);
    canvas.addEventListener('mouseup', cancelAblation, { once: true });
  } else {
    perfData.mistakes++;
    showFeedback('WRONG REGION — TARGET THE RED FAULTY NODE', 'error');
    speak('Incorrect region. Identify and target the faulty node.');
  }
}

function cancelAblation() {
  if (!ablating || ablationProgress >= 100) return;
  clearInterval(ablateInterval); ablating = false;
  canvas.style.cursor = 'crosshair';
  document.getElementById('ablate-ring').style.display = 'none';
  if (ablationProgress < 25) { showFeedback('HOLD LONGER TO COMPLETE ABLATION', 'error'); speak('Hold the node longer to complete ablation.'); ablationProgress = 0; }
}

function finishAblation() {
  ablating = false; canvas.style.cursor = 'crosshair';
  document.getElementById('ablate-ring').style.display = 'none';
  const holdSec = (Date.now() - ablateHoldStart) / 1000;
  const acc = Math.min(100, Math.round(75 + Math.min(holdSec * 5, 25)));
  updateAccDisplay(acc);
  perfData.steps.push({ step: 'ablation', accuracy: acc, time: elapsed() });
  if (faultyNode) {
    faultyNode.material.color.set(0x10b981); faultyNode.material.emissive.set(0x10b981);
    spawnSuccessParticles(faultyNode.position.clone());
    setTimeout(() => { if (faultyNode) { scene.remove(faultyNode); faultyNode = null; } }, 700);
  }
  showFeedback('ABLATION SUCCESSFUL — NODE NEUTRALIZED', 'success');
  speak('Ablation successful. Faulty node neutralized. Procedure complete.');
  advanceState();
}

// ── ADVANCE STATE ─────────────────────────────────────────────
function advanceState() {
  state++; stepsDone++;
  updateProgressUI();
  document.getElementById('s-steps').textContent = stepsDone + ' / 4';
  switch (state) {
    case STATES.OPEN_CHEST:
      setStep('STEP 2 / 4', 'OPEN CHEST', 'Click anywhere on the body to open the chest cavity');
      setInstr('CLICK ON THE BODY TO OPEN CHEST');
      iCtx.clearRect(0, 0, iCanvas.width, iCanvas.height);
      controls.enabled = true;
      document.getElementById('s-phase').textContent = 'OPEN CHEST';
      break;
    case STATES.HEART_VIEW:
      setStep('STEP 3 / 4', 'HEART VIEW', 'Examine the beating heart — locate the red faulty node');
      setInstr('ROTATE VIEW WITH MOUSE — FIND THE FAULTY NODE');
      controls.enabled = true;
      document.getElementById('s-phase').textContent = 'HEART VIEW';
      loadHeart();
      break;
    case STATES.ABLATION:
      setStep('STEP 4 / 4', 'CARDIAC ABLATION', 'Click and hold on the red pulsing node to ablate it');
      setInstr('CLICK & HOLD ON THE RED NODE TO ABLATE');
      document.getElementById('ablate-hint').style.display = 'block';
      controls.enabled = false;
      document.getElementById('s-phase').textContent = 'ABLATION';
      spawnFaultyNode();
      break;
    case STATES.COMPLETE:
      document.getElementById('ablate-hint').style.display = 'none';
      setStep('COMPLETE ✓', 'PROCEDURE DONE', 'Cardiac ablation successful — redirecting to evaluation');
      setInstr('PROCEDURE COMPLETE — LOADING EVALUATION...');
      document.getElementById('s-phase').textContent = 'COMPLETE';
      perfData.time = elapsed();
      perfData.accuracy = Math.round(totalAcc / Math.max(accCount, 1));
      sessionStorage.setItem('simResults', JSON.stringify(perfData));
      setTimeout(() => { window.location.href = 'evaluation.html'; }, 3000);
      break;
  }
}

// ── LOAD MODELS ───────────────────────────────────────────────
const loader = new GLTFLoader();

function loadHuman() {
  setLoadProg(15); setLoadTxt('LOADING HUMAN MODEL...');
  const paths = ['models/human.glb', '../aserts/models/human.glb'];
  tryLoad(paths, 0, (gltf) => {
    humanModel = gltf.scene;

    // Add to scene first so world matrix is computed
    scene.add(humanModel);

    // Compute bounding box in world space
    const box = new THREE.Box3().setFromObject(humanModel);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    console.log('Model size:', size, 'center:', center);

    // Scale so height = 3 units
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim === 0) { console.error('Model has zero size'); buildFallback(); return; }
    const scale = 3.0 / maxDim;

    humanModel.scale.setScalar(scale);
    humanModel.rotation.y = Math.PI;

    // Recompute after scale
    const box2 = new THREE.Box3().setFromObject(humanModel);
    const size2 = box2.getSize(new THREE.Vector3());
    const center2 = box2.getCenter(new THREE.Vector3());

    // Shift so chest (top 25% of body) sits at Y=0
    const chestY = box2.max.y - size2.y * 0.25;
    humanModel.position.y -= chestY;
    humanModel.position.x -= center2.x;
    humanModel.position.z -= center2.z;

    humanModel.traverse(c => {
      if (c.isMesh) {
        c.castShadow = true; c.receiveShadow = true;
        const mats = Array.isArray(c.material) ? c.material : [c.material];
        mats.forEach(m => { m.transparent = true; m.opacity = 1; });
      }
    });

    camera.position.set(0, 0, 2.6);
    controls.target.set(0, 0, 0);
    controls.update();
    setLoadProg(90);
    setTimeout(hideLoading, 500);
    drawGuideLine();
    speak('Cardiac ablation simulation ready. Step one: make the incision. Hold left mouse and drag along the cyan guide line.');
  }, buildFallback);
}

function buildFallback() {
  console.log('Using fallback body mesh');
  // Torso
  const torsoGeo = new THREE.CapsuleGeometry(0.38, 0.9, 8, 16);
  const mat = new THREE.MeshStandardMaterial({ color: 0x1a3a5c, roughness: 0.6, metalness: 0.15, wireframe: false });
  humanModel = new THREE.Group();
  const torso = new THREE.Mesh(torsoGeo, mat); torso.position.y = 0; humanModel.add(torso);
  // Head
  const headGeo = new THREE.SphereGeometry(0.22, 12, 12);
  const head = new THREE.Mesh(headGeo, mat); head.position.y = 0.82; humanModel.add(head);
  // Arms
  const armGeo = new THREE.CapsuleGeometry(0.1, 0.7, 6, 8);
  const lArm = new THREE.Mesh(armGeo, mat); lArm.position.set(-0.55, 0.1, 0); lArm.rotation.z = 0.2; humanModel.add(lArm);
  const rArm = new THREE.Mesh(armGeo, mat); rArm.position.set(0.55, 0.1, 0); rArm.rotation.z = -0.2; humanModel.add(rArm);
  // Legs
  const legGeo = new THREE.CapsuleGeometry(0.13, 0.8, 6, 8);
  const lLeg = new THREE.Mesh(legGeo, mat); lLeg.position.set(-0.2, -0.9, 0); humanModel.add(lLeg);
  const rLeg = new THREE.Mesh(legGeo, mat); rLeg.position.set(0.2, -0.9, 0); humanModel.add(rLeg);
  // Chest marker line (3D)
  const lineGeo = new THREE.BoxGeometry(0.7, 0.01, 0.01);
  const lineMat = new THREE.MeshBasicMaterial({ color: 0x0891b2 });
  const chestLine = new THREE.Mesh(lineGeo, lineMat); chestLine.position.set(0, 0.15, 0.39); humanModel.add(chestLine);

  scene.add(humanModel);
  camera.position.set(0, 0, 2.6);
  controls.target.set(0, 0, 0);
  controls.update();
  hideLoading();
  drawGuideLine();
  speak('Simulation ready. Make the incision along the guide line.');
}

function loadHeart() {
  setLoadTxt('LOADING CARDIAC MODEL...');
  const paths = ['models/realistic_human_heart.glb', '../aserts/models/realistic_human_heart.glb'];
  tryLoad(paths, 0, (gltf) => {
    heartModel = gltf.scene;
    const box = new THREE.Box3().setFromObject(heartModel);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 1.8 / maxDim;
    heartModel.scale.setScalar(scale);
    heartModel.userData.baseScale = scale;
    const center = box.getCenter(new THREE.Vector3());
    heartModel.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    heartModel.traverse(c => {
      if (c.isMesh) {
        c.castShadow = true;
        const mats = Array.isArray(c.material) ? c.material : [c.material];
        mats.forEach(m => { m.emissive = new THREE.Color(0x3d0000); m.emissiveIntensity = 0.25; });
      }
    });
    scene.add(heartModel);
    camera.position.set(0, 0.3, 3.2);
    controls.target.set(0, 0, 0);
    controls.update();
  }, () => {
    // Fallback heart
    const geo = new THREE.SphereGeometry(0.7, 20, 20);
    const mat = new THREE.MeshStandardMaterial({ color: 0x8b0000, emissive: 0x3d0000, emissiveIntensity: 0.5, roughness: 0.5 });
    heartModel = new THREE.Mesh(geo, mat);
    heartModel.userData.baseScale = 1;
    scene.add(heartModel);
    camera.position.set(0, 0.3, 3.2);
  });
}

function tryLoad(paths, idx, onSuccess, onFail) {
  if (idx >= paths.length) { console.error('All model paths failed'); onFail(); return; }
  console.log('Trying model path:', paths[idx]);
  loader.load(paths[idx], 
    (gltf) => { console.log('Model loaded from:', paths[idx]); onSuccess(gltf); },
    xhr => { if (xhr.total) setLoadProg(15 + (xhr.loaded / xhr.total) * 70); },
    (err) => { console.warn('Failed:', paths[idx], err); tryLoad(paths, idx + 1, onSuccess, onFail); }
  );
}

// ── FAULTY NODE ───────────────────────────────────────────────
function spawnFaultyNode() {
  const geo = new THREE.SphereGeometry(0.07, 20, 20);
  const mat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 2, roughness: 0.2, metalness: 0.3 });
  faultyNode = new THREE.Mesh(geo, mat);
  faultyNode.position.set(0.22, 0.15, 0.28);
  scene.add(faultyNode);
  // Outer ring
  const rGeo = new THREE.RingGeometry(0.1, 0.14, 32);
  const rMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
  const ring = new THREE.Mesh(rGeo, rMat);
  ring.lookAt(camera.position);
  faultyNode.add(ring);
  // Point light on node
  const nl = new THREE.PointLight(0xef4444, 2, 1.5);
  faultyNode.add(nl);
}

// ── SUCCESS PARTICLES ─────────────────────────────────────────
function spawnSuccessParticles(pos) {
  for (let i = 0; i < 20; i++) {
    const geo = new THREE.SphereGeometry(0.02, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const p = new THREE.Mesh(geo, mat);
    p.position.copy(pos);
    const v = new THREE.Vector3((Math.random() - 0.5) * 2, Math.random() * 2, (Math.random() - 0.5) * 2);
    scene.add(p);
    let life = 0;
    const iv = setInterval(() => {
      life += 0.05; p.position.addScaledVector(v, 0.05); p.material.opacity = 1 - life;
      if (life >= 1) { clearInterval(iv); scene.remove(p); }
    }, 30);
  }
}

// ── ANIMATION LOOP ────────────────────────────────────────────
const clock = new THREE.Clock();
let heartBeat = 0, telT = 0;

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta(), t = clock.getElapsedTime();
  controls.update();

  // Heart beat
  if (heartModel) {
    heartBeat += delta * 1.6;
    const beat = 1 + Math.sin(heartBeat * Math.PI * 2) * 0.035 + Math.sin(heartBeat * Math.PI * 4) * 0.012;
    const base = heartModel.userData.baseScale || 1;
    heartModel.scale.setScalar(base * beat);
    heartModel.rotation.y = Math.sin(t * 0.2) * 0.05;
  }

  // Faulty node pulse
  if (faultyNode) {
    faultyNode.material.emissiveIntensity = 1.5 + Math.sin(t * 5) * 1.0;
    faultyNode.scale.setScalar(1 + Math.sin(t * 6) * 0.18);
    // Keep ring facing camera
    if (faultyNode.children[0]) faultyNode.children[0].lookAt(camera.position);
  }

  // Human model subtle sway
  if (humanModel && state === STATES.INCISION) humanModel.rotation.y = Math.PI + Math.sin(t * 0.25) * 0.04;

  // Fill light pulse
  fillLight.intensity = 1.8 + Math.sin(t * 1.5) * 0.4;

  // Telemetry
  telT += delta;
  const bpm = Math.round(72 + Math.sin(telT * 1.1) * 7 + (state >= STATES.ABLATION ? 18 : 0));
  const o2 = Math.round(98 - (state >= STATES.ABLATION ? 2 : 0));
  const tPulse = document.getElementById('t-pulse');
  tPulse.textContent = bpm + ' BPM';
  tPulse.className = 'tele-val' + (bpm > 95 ? ' warn' : '') + (bpm > 115 ? ' danger' : '');
  document.getElementById('pulse-fill').style.width = Math.min(bpm, 130) / 1.3 + '%';
  document.getElementById('t-o2').textContent = o2 + '%';
  document.getElementById('t-o2').className = 'tele-val' + (o2 < 95 ? ' warn' : '');

  // Timer
  const s = elapsed(), m = String(Math.floor(s / 60)).padStart(2, '0'), sec = String(s % 60).padStart(2, '0');
  document.getElementById('s-time').textContent = m + ':' + sec;

  drawParticles();
  drawECG();
  renderer.render(scene, camera);
}

// ── UI HELPERS ────────────────────────────────────────────────
function setStep(label, title, hint) {
  document.getElementById('step-label').textContent = label;
  document.getElementById('step-title').textContent = title;
  document.getElementById('step-hint').textContent = hint;
}
function setInstr(t) { document.getElementById('instruction-box').textContent = t; }
function showFeedback(msg, type = '') {
  const el = document.getElementById('feedback');
  el.textContent = msg; el.className = type; el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0'; }, 2800);
}
function updateAccDisplay(acc) {
  totalAcc += acc; accCount++;
  document.getElementById('t-acc').textContent = acc + '%';
  document.getElementById('t-acc').className = 'tele-val' + (acc < 50 ? ' danger' : acc < 75 ? ' warn' : '');
}
function updateProgressUI() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById('dot-' + i), lbl = document.getElementById('lbl-' + i);
    if (i < state) { dot.className = 'prog-dot done'; lbl.className = 'prog-label'; }
    else if (i === state) { dot.className = 'prog-dot active'; lbl.className = 'prog-label active'; }
    else { dot.className = 'prog-dot'; lbl.className = 'prog-label'; }
    if (i < 3) document.getElementById('line-' + i).className = 'prog-line' + (i < state ? ' done' : '');
  }
}
function setLoadProg(p) { document.getElementById('loading-bar').style.width = p + '%'; }
function setLoadTxt(t) { document.getElementById('loading-text').textContent = t; }
function hideLoading() {
  setLoadProg(100);
  setTimeout(() => {
    const ol = document.getElementById('loading-overlay');
    ol.style.opacity = '0';
    setTimeout(() => ol.style.display = 'none', 700);
  }, 400);
}
function elapsed() { return Math.round((Date.now() - startTime) / 1000); }

// ── SPEECH ────────────────────────────────────────────────────
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
window.speechSynthesis && window.speechSynthesis.addEventListener && window.speechSynthesis.onvoiceschanged !== undefined
  ? (window.speechSynthesis.onvoiceschanged = () => {}) : null;

// ── KEYBOARD ──────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.code === 'Space') { e.preventDefault(); if (state === STATES.OPEN_CHEST) triggerOpen(); }
  if (e.code === 'KeyR') { controls.enabled = !controls.enabled; showFeedback(controls.enabled ? 'ORBIT MODE ON' : 'ORBIT MODE OFF'); }
  if (e.code === 'KeyH') showFeedback('R=ORBIT | SPACE=CONFIRM | DRAG=INCISION | CLICK+HOLD=ABLATE');
});

// ── INIT ──────────────────────────────────────────────────────
loadHuman();
animate();
