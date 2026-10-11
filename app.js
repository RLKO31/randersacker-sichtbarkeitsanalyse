import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- STATE MANAGEMENT ---
const state = {
  activeAntennaId: 3,
  showViewshed: true,
  showRays: true,
  showBuildings: true,
  showWireframe: false,
  autoRotate: true,
  exaggeration: 1.5,
  isLightTheme: false
};

// --- THREE.JS GLOBALS ---
let scene, camera, renderer, controls;
let terrainMesh = null, terrainWireframe = null;
let terrainGeometry = null;
let buildingsGroup = new THREE.Group();
let raysGroup = new THREE.Group();
let antennasGroup = new THREE.Group();
let gridHelper = null;
let dirLight1, dirLight2, hemiLight, ambientLight;

// Data containers
let terrainData = null;
let antennasData = [];
let sightlinesData = [];
let buildingsData = [];

// Scene scale offset: translate UTM (X: 570000..573000, Y: 5511000..5513000)
// Center point near Randersacker:
const CENTER_X = 571500.0;
const CENTER_Y = 5512000.0;
const BASE_Z = 169.0;
const SCALE_XY = 0.08; // 3000m * 0.08 = 240 units in 3D scene
const SCALE_Z = 0.08;  // Height scale

// --- INITIALIZATION ---
async function init() {
  const container = document.getElementById('canvas-container');

  // 1. Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070d18);
  scene.fog = new THREE.FogExp2(0x070d18, 0.0035);

  // 2. Camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 3000);
  camera.position.set(130, 100, 150);

  // 3. Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  // 4. Orbit Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 15;
  controls.maxDistance = 600;
  controls.maxPolarAngle = Math.PI / 2 - 0.02;
  controls.autoRotate = state.autoRotate;
  controls.autoRotateSpeed = 0.65;
  controls.target.set(0, 10, 0);

  // 5. Lighting
  setupLighting();

  // 6. Ground Helper
  setupEnvironment();

  // 7. Groups
  scene.add(buildingsGroup);
  scene.add(raysGroup);
  scene.add(antennasGroup);

  // 8. Event Listeners
  setupEventListeners();
  window.addEventListener('resize', onWindowResize);

  // 9. Fetch and Load Geospatial Datasets
  await loadAllData();

  // 10. Start Animation Loop
  animate();
}

// --- LIGHTING ---
function setupLighting() {
  ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x1e293b, 0.6);
  hemiLight.position.set(0, 200, 0);
  scene.add(hemiLight);

  // Sunlight (Key)
  dirLight1 = new THREE.DirectionalLight(0xfff7ed, 1.35);
  dirLight1.position.set(140, 200, 110);
  dirLight1.castShadow = true;
  dirLight1.shadow.mapSize.width = 2048;
  dirLight1.shadow.mapSize.height = 2048;
  dirLight1.shadow.camera.near = 10;
  dirLight1.shadow.camera.far = 700;
  dirLight1.shadow.camera.left = -160;
  dirLight1.shadow.camera.right = 160;
  dirLight1.shadow.camera.top = 160;
  dirLight1.shadow.camera.bottom = -160;
  dirLight1.shadow.bias = -0.0003;
  scene.add(dirLight1);

  // Sky Bounce Light
  dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.45);
  dirLight2.position.set(-130, 80, -110);
  scene.add(dirLight2);
}

function setupEnvironment() {
  gridHelper = new THREE.GridHelper(300, 30, 0x0284c7, 0x1e293b);
  gridHelper.position.y = -0.2;
  gridHelper.material.opacity = 0.25;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);
}

// --- LOAD DATASETS ---
async function loadAllData() {
  try {
    updateLoader(true, 'Lade 3D-Geländerelief & Viewshed-Raster...', 25);
    const [resTerrain, resAnt, resSight, resBuild] = await Promise.all([
      fetch('assets/terrain.json').then(r => r.json()),
      fetch('assets/antennas.json').then(r => r.json()),
      fetch('assets/sightlines.json').then(r => r.json()),
      fetch('assets/buildings.json').then(r => r.json())
    ]);

    terrainData = resTerrain;
    antennasData = resAnt;
    sightlinesData = resSight;
    buildingsData = resBuild;

    updateLoader(true, 'Generiere 3D-Oberflächennetz & Gebäude...', 65);
    buildTerrainMesh();
    buildAntennas();
    buildSightlines();
    buildBuildings();

    updateLoader(false);
  } catch (err) {
    console.error('Fehler beim Laden der Geodaten:', err);
    updateLoader(true, 'Fehler beim Laden der Datensätze!', 100);
    setTimeout(() => updateLoader(false), 2000);
  }
}

// --- BUILD TERRAIN MESH ---
function buildTerrainMesh() {
  if (!terrainData) return;
  const { nx, ny, width, height, dem, viewshed, originX, originY } = terrainData;

  // Plane geometry: nx columns, ny rows
  const worldWidth = width * SCALE_XY;
  const worldHeight = height * SCALE_XY;

  terrainGeometry = new THREE.PlaneGeometry(worldWidth, worldHeight, nx - 1, ny - 1);
  terrainGeometry.rotateX(-Math.PI / 2); // Lay flat on XZ plane

  const posAttr = terrainGeometry.attributes.position;
  const colors = [];

  // Hypsometric terrain colors & viewshed green overlay
  for (let i = 0; i < posAttr.count; i++) {
    const elev = dem[i] || BASE_Z;
    const isVisible = viewshed[i] === 1;

    // Set Y elevation with exaggeration factor
    const yVal = (elev - BASE_Z) * SCALE_Z * state.exaggeration;
    posAttr.setY(i, yVal);

    // Color computation
    const t = THREE.MathUtils.clamp((elev - 170) / (325 - 170), 0.0, 1.0);
    const baseColor = new THREE.Color();
    
    // Elevation Ramp: Maintal (Dark Slate/Green) -> Hang (Amber/Olive) -> Hochebene (Sandstein)
    baseColor.setRGB(
      0.15 + t * 0.45,
      0.25 + (1.0 - Math.abs(t - 0.5) * 2) * 0.25,
      0.30 - t * 0.15
    );

    // If viewshed overlay is enabled and point is visible:
    if (state.showViewshed && isVisible) {
      // Emerald green glowing tone
      baseColor.setRGB(0.1, 0.85, 0.35);
    }

    colors.push(baseColor.r, baseColor.g, baseColor.b);
  }

  terrainGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  terrainGeometry.computeVertexNormals();

  const terrainMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.85,
    metalness: 0.1,
    flatShading: false
  });

  terrainMesh = new THREE.Mesh(terrainGeometry, terrainMat);
  terrainMesh.receiveShadow = true;
  terrainMesh.castShadow = true;
  scene.add(terrainMesh);

  // Wireframe
  const wireGeo = new THREE.WireframeGeometry(terrainGeometry);
  const wireMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.2,
    linewidth: 1
  });
  terrainWireframe = new THREE.LineSegments(wireGeo, wireMat);
  terrainWireframe.visible = state.showWireframe;
  scene.add(terrainWireframe);
}

function updateTerrainColors() {
  if (!terrainGeometry || !terrainData) return;
  const { dem, viewshed } = terrainData;
  const colors = [];

  for (let i = 0; i < terrainGeometry.attributes.position.count; i++) {
    const elev = dem[i] || BASE_Z;
    const isVisible = viewshed[i] === 1;
    const t = THREE.MathUtils.clamp((elev - 170) / (325 - 170), 0.0, 1.0);
    const baseColor = new THREE.Color();

    baseColor.setRGB(
      0.15 + t * 0.45,
      0.25 + (1.0 - Math.abs(t - 0.5) * 2) * 0.25,
      0.30 - t * 0.15
    );

    if (state.showViewshed && isVisible) {
      baseColor.setRGB(0.1, 0.85, 0.35);
    }
    colors.push(baseColor.r, baseColor.g, baseColor.b);
  }

  terrainGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  terrainGeometry.attributes.color.needsUpdate = true;
}

function updateTerrainExaggeration() {
  if (!terrainGeometry || !terrainData) return;
  const posAttr = terrainGeometry.attributes.position;
  const { dem } = terrainData;

  for (let i = 0; i < posAttr.count; i++) {
    const elev = dem[i] || BASE_Z;
    const yVal = (elev - BASE_Z) * SCALE_Z * state.exaggeration;
    posAttr.setY(i, yVal);
  }

  posAttr.needsUpdate = true;
  terrainGeometry.computeVertexNormals();
}

// --- BUILD ANTENNAS ---
function buildAntennas() {
  while (antennasGroup.children.length > 0) {
    antennasGroup.remove(antennasGroup.children[0]);
  }

  antennasData.forEach(ant => {
    const posX = (ant.x - CENTER_X) * SCALE_XY;
    const posZ = -(ant.y - CENTER_Y) * SCALE_XY;
    const posY = (ant.z - BASE_Z) * SCALE_Z * state.exaggeration;

    const group = new THREE.Group();
    group.position.set(posX, posY, posZ);

    const isMain = ant.id === 3;
    const mastHeight = isMain ? 12 : 8;
    const mastRadius = isMain ? 0.7 : 0.4;
    const color = isMain ? 0x10b981 : 0x0284c7;

    // Lattice Tower / Mast
    const mastGeo = new THREE.CylinderGeometry(mastRadius * 0.4, mastRadius, mastHeight, 6);
    mastGeo.translate(0, mastHeight / 2, 0);
    const mastMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.8,
      roughness: 0.3
    });
    const mastMesh = new THREE.Mesh(mastGeo, mastMat);
    group.add(mastMesh);

    // Emitter beacon at top
    const beaconGeo = new THREE.SphereGeometry(isMain ? 1.5 : 1.0, 16, 16);
    beaconGeo.translate(0, mastHeight + 0.5, 0);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    group.add(beacon);

    // Animated signal wave circles for Antenna 3
    if (isMain) {
      const ringGeo = new THREE.RingGeometry(2, 2.4, 32);
      ringGeo.rotateX(-Math.PI / 2);
      ringGeo.translate(0, mastHeight + 0.5, 0);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide
      });
      const waveRing = new THREE.Mesh(ringGeo, ringMat);
      waveRing.name = 'waveRing';
      group.add(waveRing);
    }

    antennasGroup.add(group);
  });
}

// --- BUILD 3D SIGHTLINES ---
function buildSightlines() {
  while (raysGroup.children.length > 0) {
    raysGroup.remove(raysGroup.children[0]);
  }

  if (!sightlinesData || sightlinesData.length === 0) return;

  const positionsVis = [];
  const positionsBlock = [];

  sightlinesData.forEach(line => {
    const isVis = line.vis === 1;
    const targetArr = isVis ? positionsVis : positionsBlock;

    for (let k = 0; k < line.pts.length - 1; k++) {
      const p1 = line.pts[k];
      const p2 = line.pts[k + 1];

      const x1 = (p1[0] - CENTER_X) * SCALE_XY;
      const z1 = -(p1[1] - CENTER_Y) * SCALE_XY;
      const y1 = (p1[2] - BASE_Z) * SCALE_Z * state.exaggeration;

      const x2 = (p2[0] - CENTER_X) * SCALE_XY;
      const z2 = -(p2[1] - CENTER_Y) * SCALE_XY;
      const y2 = (p2[2] - BASE_Z) * SCALE_Z * state.exaggeration;

      targetArr.push(x1, y1, z1, x2, y2, z2);
    }
  });

  // Visible Lines (Green)
  if (positionsVis.length > 0) {
    const geoVis = new THREE.BufferGeometry();
    geoVis.setAttribute('position', new THREE.Float32BufferAttribute(positionsVis, 3));
    const matVis = new THREE.LineBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.7,
      linewidth: 1
    });
    raysGroup.add(new THREE.LineSegments(geoVis, matVis));
  }

  // Blocked Lines (Red)
  if (positionsBlock.length > 0) {
    const geoBlock = new THREE.BufferGeometry();
    geoBlock.setAttribute('position', new THREE.Float32BufferAttribute(positionsBlock, 3));
    const matBlock = new THREE.LineBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.45,
      linewidth: 1
    });
    raysGroup.add(new THREE.LineSegments(geoBlock, matBlock));
  }

  raysGroup.visible = state.showRays;
}

// --- BUILD BUILDINGS ---
function buildBuildings() {
  while (buildingsGroup.children.length > 0) {
    buildingsGroup.remove(buildingsGroup.children[0]);
  }

  if (!buildingsData || buildingsData.length === 0) return;

  const bldgMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.6,
    metalness: 0.15
  });

  // Construct triangular meshes from building footprint polygons with heights
  const geometries = [];

  buildingsData.forEach(b => {
    b.polys.forEach(ring => {
      if (ring.length < 3) return;
      // Extrude simple prisms from 2D ring with roof height
      const shape = new THREE.Shape();
      const avgZ = ring.reduce((sum, pt) => sum + pt[2], 0) / ring.length;
      const heightVal = Math.max(2.0, (avgZ - BASE_Z) * SCALE_Z * state.exaggeration);

      const startPt = ring[0];
      shape.moveTo(
        (startPt[0] - CENTER_X) * SCALE_XY,
        -(startPt[1] - CENTER_Y) * SCALE_XY
      );

      for (let k = 1; k < ring.length; k++) {
        shape.lineTo(
          (ring[k][0] - CENTER_X) * SCALE_XY,
          -(ring[k][1] - CENTER_Y) * SCALE_XY
        );
      }

      const extrudeSettings = {
        depth: heightVal,
        bevelEnabled: false
      };

      try {
        const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geo.rotateX(-Math.PI / 2); // Lay flat
        geometries.push(geo);
      } catch (e) {
        // Skip invalid non-simple polygons
      }
    });
  });

  if (geometries.length > 0) {
    // Group and add
    const mergedMeshGroup = new THREE.Group();
    geometries.slice(0, 500).forEach(g => {
      const m = new THREE.Mesh(g, bldgMat);
      m.castShadow = true;
      m.receiveShadow = true;
      mergedMeshGroup.add(m);
    });
    buildingsGroup.add(mergedMeshGroup);
  }

  buildingsGroup.visible = state.showBuildings;
}

// --- CAMERA VIEWPOINTS ---
function setCameraView(viewKey) {
  const targetCam = new THREE.Vector3();
  const targetLook = new THREE.Vector3(0, 10, 0);

  switch (viewKey) {
    case 'iso':
      targetCam.set(130, 100, 150);
      targetLook.set(0, 10, 0);
      break;
    case 'antenna':
      // Zoom into Antenna 3
      const ant3 = antennasData.find(a => a.id === 3);
      if (ant3) {
        const ax = (ant3.x - CENTER_X) * SCALE_XY;
        const az = -(ant3.y - CENTER_Y) * SCALE_XY;
        const ay = (ant3.z - BASE_Z) * SCALE_Z * state.exaggeration;
        targetCam.set(ax + 30, ay + 20, az + 40);
        targetLook.set(ax, ay + 8, az);
      }
      break;
    case 'valley':
      // View from Randersacker valley center
      targetCam.set(-10, 25, 20);
      targetLook.set(30, 20, -10);
      break;
    case 'top':
      targetCam.set(0, 220, 2);
      targetLook.set(0, 0, 0);
      break;
  }

  let step = 0;
  function tween() {
    if (step < 30) {
      camera.position.lerp(targetCam, 0.1);
      controls.target.lerp(targetLook, 0.1);
      controls.update();
      step++;
      requestAnimationFrame(tween);
    }
  }
  tween();
}

// --- UI EVENT LISTENERS ---
function setupEventListeners() {
  // Antenna buttons
  const antBtns = document.querySelectorAll('#antenna-buttons .antenna-btn');
  antBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      antBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const id = parseInt(btn.dataset.id);
      state.activeAntennaId = id;

      const headerText = document.getElementById('header-focus-text');
      if (headerText) {
        const ant = antennasData.find(a => a.id === id);
        headerText.textContent = `Fokus: ${btn.querySelector('strong').textContent} (${ant ? ant.z : ''} m)`;
      }

      setCameraView(id === 3 ? 'antenna' : 'iso');
    });
  });

  // Toggles
  const togViewshed = document.getElementById('toggle-viewshed');
  if (togViewshed) {
    togViewshed.addEventListener('change', (e) => {
      state.showViewshed = e.target.checked;
      updateTerrainColors();
    });
  }

  const togRays = document.getElementById('toggle-rays');
  if (togRays) {
    togRays.addEventListener('change', (e) => {
      state.showRays = e.target.checked;
      raysGroup.visible = state.showRays;
    });
  }

  const togBuildings = document.getElementById('toggle-buildings');
  if (togBuildings) {
    togBuildings.addEventListener('change', (e) => {
      state.showBuildings = e.target.checked;
      buildingsGroup.visible = state.showBuildings;
    });
  }

  const togWire = document.getElementById('toggle-wireframe');
  if (togWire) {
    togWire.addEventListener('change', (e) => {
      state.showWireframe = e.target.checked;
      if (terrainWireframe) terrainWireframe.visible = state.showWireframe;
    });
  }

  const togAuto = document.getElementById('toggle-autorotate');
  if (togAuto) {
    togAuto.addEventListener('change', (e) => {
      state.autoRotate = e.target.checked;
      controls.autoRotate = state.autoRotate;
    });
  }

  // Camera presets
  const camBtns = document.querySelectorAll('.cam-btn');
  camBtns.forEach(btn => {
    btn.addEventListener('click', () => setCameraView(btn.dataset.cam));
  });

  // Exaggeration Slider
  const sliderExag = document.getElementById('slider-exaggeration');
  const valExag = document.getElementById('exaggeration-val');
  if (sliderExag && valExag) {
    sliderExag.addEventListener('input', (e) => {
      state.exaggeration = parseFloat(e.target.value);
      valExag.textContent = `${state.exaggeration.toFixed(1)}x`;
      updateTerrainExaggeration();
      buildAntennas();
      buildSightlines();
      buildBuildings();
    });
  }

  // Theme toggle
  const themeBtn = document.getElementById('btn-theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  // Gallery Modal
  const galleryModal = document.getElementById('gallery-modal');
  const openGalleryBtn = document.getElementById('btn-open-gallery');
  const closeGalleryBtn = document.getElementById('btn-close-gallery');
  if (openGalleryBtn && galleryModal) openGalleryBtn.addEventListener('click', () => galleryModal.classList.add('active'));
  if (closeGalleryBtn && galleryModal) closeGalleryBtn.addEventListener('click', () => galleryModal.classList.remove('active'));
  if (galleryModal) {
    galleryModal.addEventListener('click', (e) => {
      if (e.target === galleryModal) galleryModal.classList.remove('active');
    });
  }

  // Legal Modal
  const legalModal = document.getElementById('legal-modal');
  const openLegalBtn = document.getElementById('btn-open-legal');
  const closeLegalBtn = document.getElementById('btn-close-modal');
  const ackLegalBtn = document.getElementById('btn-modal-ack');
  const linkFooter = document.getElementById('link-legal-modal');

  const openLegal = () => { if (legalModal) legalModal.classList.add('active'); };
  const closeLegal = () => { if (legalModal) legalModal.classList.remove('active'); };

  if (openLegalBtn) openLegalBtn.addEventListener('click', openLegal);
  if (linkFooter) linkFooter.addEventListener('click', (e) => { e.preventDefault(); openLegal(); });
  if (closeLegalBtn) closeLegalBtn.addEventListener('click', closeLegal);
  if (ackLegalBtn) ackLegalBtn.addEventListener('click', closeLegal);
  if (legalModal) {
    legalModal.addEventListener('click', (e) => {
      if (e.target === legalModal) closeLegal();
    });
  }
}

// --- THEME TOGGLE ---
function toggleTheme() {
  state.isLightTheme = !state.isLightTheme;
  document.body.classList.toggle('theme-light', state.isLightTheme);

  if (state.isLightTheme) {
    scene.background.set(0xe2e8f0);
    scene.fog.color.set(0xe2e8f0);
    ambientLight.intensity = 0.8;
    dirLight1.intensity = 1.2;
    hemiLight.color.set(0xffffff);
    hemiLight.groundColor.set(0x94a3b8);
    if (gridHelper) gridHelper.material.opacity = 0.15;
  } else {
    scene.background.set(0x070d18);
    scene.fog.color.set(0x070d18);
    ambientLight.intensity = 0.5;
    dirLight1.intensity = 1.35;
    hemiLight.color.set(0x7dd3fc);
    hemiLight.groundColor.set(0x1e293b);
    if (gridHelper) gridHelper.material.opacity = 0.25;
  }
}

// --- LOADER ---
function updateLoader(show, text = '', progress = 0) {
  const overlay = document.getElementById('loader-overlay');
  const statusEl = document.getElementById('loader-status');
  const barEl = document.getElementById('loader-progress-bar');

  if (statusEl && text) statusEl.textContent = text;
  if (barEl && progress) barEl.style.width = `${progress}%`;

  if (overlay) {
    if (show) overlay.classList.remove('fade-out');
    else overlay.classList.add('fade-out');
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- RENDER LOOP ---
let waveClock = 0;
function animate() {
  requestAnimationFrame(animate);

  // Pulse wave ring around Antenna 3
  const waveRing = antennasGroup.getObjectByName('waveRing');
  if (waveRing) {
    waveClock += 0.04;
    const s = 1.0 + (Math.sin(waveClock) + 1.0) * 0.8;
    waveRing.scale.set(s, s, s);
    waveRing.material.opacity = 0.8 - (s - 1.0) * 0.45;
  }

  controls.update();
  renderer.render(scene, camera);
}

init();
