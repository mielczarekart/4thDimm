import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import './style.css';
import * as THREE from 'three';

const app = document.querySelector<HTMLDivElement>('#app');
if (app) {
  // Overlays
  const overlayScreen = document.createElement('div');
  overlayScreen.style.position = 'absolute';
  overlayScreen.style.top = '10px';
  overlayScreen.style.left = '10px';
  overlayScreen.style.background = 'rgba(0,0,0,0.7)';
  overlayScreen.style.color = '#fff';
  overlayScreen.style.fontSize = '12px';
  overlayScreen.style.padding = '8px';
  overlayScreen.style.borderRadius = '4px';
  overlayScreen.style.zIndex = '10';
  document.body.appendChild(overlayScreen);

  const overlay3d = document.createElement('div');
  overlay3d.style.position = 'absolute';
  overlay3d.style.top = '10px';
  overlay3d.style.right = '10px';
  overlay3d.style.background = 'rgba(0,0,0,0.7)';
  overlay3d.style.color = '#fff';
  overlay3d.style.fontSize = '12px';
  overlay3d.style.padding = '8px';
  overlay3d.style.borderRadius = '4px';
  overlay3d.style.zIndex = '10';
  document.body.appendChild(overlay3d);

  // Add overlay for commands/help at the top center
const overlayHelp = document.createElement('div');
overlayHelp.style.position = 'absolute';
overlayHelp.style.top = '10px';
overlayHelp.style.left = '25%';
overlayHelp.style.transform = 'translateX(-50%)';
overlayHelp.style.background = 'rgba(0,0,0,0.7)';
overlayHelp.style.color = '#fff';
overlayHelp.style.fontSize = '13px';
overlayHelp.style.padding = '8px 16px';
overlayHelp.style.borderRadius = '4px';
overlayHelp.style.zIndex = '20';
overlayHelp.style.textAlign = 'left';
overlayHelp.innerHTML = `
<b>Controls:</b><br>
Mouse drag: Rotate blue object<br>
Shift + Mouse drag: Roll blue object<br>
A: Toggle auto-rotate<br>
T: Toggle blue object visibility<br>
Y: Toggle green object visibility<br>
R: Reset blue object rotation & auto-rotate speed<br>
+ / - : Change auto-rotate speed<br>
Numpad 4/6: Rotate camera yaw left/right<br>
Numpad 8/2: Rotate camera pitch up/down<br>
Numpad 1/3: Rotate camera Roll left/right<br>
Numpad 7/9: Zoom camera in/out<br>
Numpad 5: Reset camera<br>
1: Load cube<br>
2: Load pyramid<br>
3: Load icosphere<br>
4: Load cross<br>
H: Toggle this help overlay<br>
`;
document.body.appendChild(overlayHelp);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(800, 600);
  app.appendChild(renderer.domElement);
  
  
  let meshName = 'cross.stl';

  // Add key controls for changing the loaded model
window.addEventListener('keydown', (e: KeyboardEvent) => {
  let newMeshName = meshName;
  if (e.code === 'Digit1') newMeshName = 'cube.stl';
  if (e.code === 'Digit2') newMeshName = 'piramid.stl';
  if (e.code === 'Digit3') newMeshName = 'icosphere.stl';
  if (e.code === 'Digit4') newMeshName = 'cross.stl'; 

  if (newMeshName !== meshName) {
    meshName = newMeshName;

    // Remove previous meshes from scene
    if (originalCross) scene.remove(originalCross);
    if (cross) scene.remove(cross);

    // Reload STL models
    const stlLoader = new STLLoader();
    stlLoader.load(meshName, (geometry: THREE.BufferGeometry) => {
      stlGeometryOriginal = geometry.clone();
      const stlMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff, wireframe: false, opacity: 0.3, transparent: true });
      originalCross = new THREE.Mesh(stlGeometryOriginal, stlMaterial);
      originalCross.position.set(0, 0, 0);
      originalCross.scale.set(0.5, 0.5, 0.5);
      scene.add(originalCross);

      const stlWireframe = new THREE.LineSegments(
        new THREE.WireframeGeometry(stlGeometryOriginal),
        new THREE.LineBasicMaterial({ color: 0x0000ff })
      );
      originalCross.add(stlWireframe);
    });

    const stlLoader2 = new STLLoader();
    stlLoader2.load(meshName, (geometry: THREE.BufferGeometry) => {
      stlGeometryDeformed = geometry.clone();
      const stlMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff09, wireframe: false, opacity: 1, transparent: true });
      cross = new THREE.Mesh(stlGeometryDeformed, stlMaterial);
      cross.scale.set(0.5, 0.5, 0.5);
      scene.add(cross);

      const stlWireframe = new THREE.LineSegments(
        new THREE.WireframeGeometry(stlGeometryDeformed),
        new THREE.LineBasicMaterial({ color: 0x00ff09 })
      );
      cross.add(stlWireframe);
    });
  }
});

  // Mouse rotation state
  let isDragging = false;
  let isShift = false;
  let isAutoRotate = false;
  let prevMouse = { x: 0, y: 0, z: 0 };
  let accumulatedDelta = { x: 0, y: 0, z: 0 };
  const sensitivity = 0.01;

  // AutoRotate Speeds
  let autoRotateSpeedX = 0.001;
  let autoRotateSpeedY = 0.002;
  let autoRotateSpeedZ = 0.003;
  // Camera rotation state
let cameraAngleY = 0;
let cameraAngleX = 0;
let cameraAngleZ = 0;
let cameraRadius = 3;

// Hide show help overlay
let overlayHelpVisible = true;

window.addEventListener('keydown', (e: KeyboardEvent) => {
  // ...existing key handlers...
  if (e.key === 'h' || e.key === 'H') {
    overlayHelpVisible = !overlayHelpVisible;
    overlayHelp.style.display = overlayHelpVisible ? 'block' : 'none';
  }
});

// Add keyboard controls for camera rotation (numpad)
window.addEventListener('keydown', (e: KeyboardEvent) => {
  switch (e.code) {
    case 'Numpad4': // yaw left
      cameraAngleY -= 0.1;
      break;
    case 'Numpad6': // yaw right
      cameraAngleY += 0.1;
      break;
    case 'Numpad8': // pitch up
      cameraAngleX -= 0.1;
      break;
    case 'Numpad2': // pitch down
      cameraAngleX += 0.1;
      break;
    case 'Numpad1': // roll left
      cameraAngleZ -= 0.1;
      break;
    case 'Numpad3': // roll right
      cameraAngleZ += 0.1;
      break;
    case 'Numpad7': // zoom in
      cameraRadius = Math.max(1, cameraRadius - 0.2);
      break;
    case 'Numpad9': // zoom out
      cameraRadius += 0.2;
      break;
    case 'Numpad5': // reset
      cameraAngleX = 0;
      cameraAngleY = 0;
      cameraAngleZ = 0;
      cameraRadius = 3; 

      break;
  }
});

  renderer.domElement.addEventListener('mousedown', (e: MouseEvent) => {
    isDragging = true;
    prevMouse.x = e.clientX;
    prevMouse.y = e.clientY;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Shift') isShift = true;
    if (e.key === 'a') isAutoRotate = !isAutoRotate;
    if (e.key === 't') toogleBlueCross();
    if (e.key === 'y') {
      if (cross) cross.visible = !cross.visible;
    }
    if (e.key === 'r') restartRotation();
    if (e.key === '+') AutoRotateSpeedChange(true);
    if (e.key === '-') AutoRotateSpeedChange(false);
  });

  window.addEventListener('keyup', (e: KeyboardEvent) => {
    if (e.key === 'Shift') isShift = false;
  });

  window.addEventListener('mousemove', (e: MouseEvent) => {
    if (isDragging) {
      accumulatedDelta.x += e.clientX - prevMouse.x;
      accumulatedDelta.y += e.clientY - prevMouse.y;
      if (isShift) accumulatedDelta.z += e.clientX - prevMouse.x;
      prevMouse.x = e.clientX;
      prevMouse.y = e.clientY;
    }
  });

  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  camera.position.z = 3;

  // Lighting
  const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
  directionalLight.position.set(2, 5, 5);
  scene.add(directionalLight);

  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);

// Add static background dots in a regular 3D grid
const backgroundDots: THREE.Mesh[] = [];
const dotGeometry = new THREE.SphereGeometry(0.01, 2, 2);
const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

const gridSize = 5; // number of dots per axis
const spacing = 1; // distance between dots

for (let ix = 0; ix < gridSize; ix++) {
  for (let iy = 0; iy < gridSize; iy++) {
    for (let iz = 0; iz < gridSize; iz++) {
      const x = (ix - gridSize / 2) * spacing;
      const y = (iy - gridSize / 2) * spacing;
      const z = (iz - gridSize / 2) * spacing;
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      dot.position.set(x, y, z);
      scene.add(dot);
      backgroundDots.push(dot);
    }
  }
}


// STL mesh and geometry references
let originalCross: THREE.Mesh | null = null;
let cross: THREE.Mesh | null = null;
let stlGeometryOriginal: THREE.BufferGeometry | null = null;
let stlGeometryDeformed: THREE.BufferGeometry | null = null;

// Load STL model for blue cross
const stlLoader = new STLLoader();
stlLoader.load(meshName, (geometry: THREE.BufferGeometry) => {
  stlGeometryOriginal = geometry.clone();
  const stlMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff, wireframe: false, opacity: 0.3, transparent: true });
  originalCross = new THREE.Mesh(stlGeometryOriginal, stlMaterial);
  originalCross.position.set(0, 0, 0);
  originalCross.scale.set(0.5, 0.5, 0.5);
  scene.add(originalCross);

  // Add wireframe overlay to blue STL mesh
  const stlWireframe = new THREE.LineSegments(
    new THREE.WireframeGeometry(stlGeometryOriginal),
    new THREE.LineBasicMaterial({ color: 0x0000ff })
  );
  originalCross.add(stlWireframe);
});

// Load STL model for green cross (deformed)
const stlLoader2 = new STLLoader();
stlLoader2.load(meshName, (geometry: THREE.BufferGeometry) => {
  stlGeometryDeformed = geometry.clone();
  const stlMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff09, wireframe: false, opacity: 1, transparent: true });
  cross = new THREE.Mesh(stlGeometryDeformed, stlMaterial);
  //cross.position.set(-0.5, 0.1, -0.5);
  cross.scale.set(0.5, 0.5, 0.5);
  scene.add(cross);

  // Add wireframe overlay to green STL mesh
  const stlWireframe = new THREE.LineSegments(
    new THREE.WireframeGeometry(stlGeometryDeformed),
    new THREE.LineBasicMaterial({ color: 0x00ff09 })
  );
  cross.add(stlWireframe);
});

function toogleBlueCross() {
  if (originalCross) originalCross.visible = !originalCross.visible;
}

function restartRotation() {
  if (originalCross) originalCross.rotation.set(0, 0, 0);
  autoRotateSpeedX = 0.002;
  autoRotateSpeedY = 0.002;
  autoRotateSpeedZ = 0.002;
}

function AutoRotateSpeedChange(bool: boolean) {
  let speed = bool ? 0.001 : -0.001;
  autoRotateSpeedX += speed;
  autoRotateSpeedY += speed;
  autoRotateSpeedZ += speed;
}

function animate() {
  requestAnimationFrame(animate);

  // Only run logic if STL meshes are loaded
  if (!originalCross || !cross || !stlGeometryOriginal || !stlGeometryDeformed) {
    renderer.render(scene, camera);
    return;
  }

  // Apply accumulated mouse rotation per frame for smoothness
  if (!isAutoRotate && (accumulatedDelta.x !== 0 || accumulatedDelta.y !== 0)) {
    originalCross.rotation.y += accumulatedDelta.x * sensitivity;
    originalCross.rotation.x += accumulatedDelta.y * sensitivity;
    originalCross.rotation.z += accumulatedDelta.z * sensitivity;
    accumulatedDelta.x = 0;
    accumulatedDelta.y = 0;
    accumulatedDelta.z = 0;
  } else if (isAutoRotate) {
    originalCross.rotation.x += autoRotateSpeedX;
    originalCross.rotation.y += autoRotateSpeedY;
    originalCross.rotation.z += autoRotateSpeedZ;
  }

  // Get positions from blue STL mesh
  const position = stlGeometryOriginal.attributes.position;
  const originalPositions: { x: number, y: number, z: number }[] = [];
  for (let i = 0; i < position.count; i++) {
    originalPositions.push({
      x: position.getX(i),
      y: position.getY(i),
      z: position.getZ(i)
    });
  }

  // Calculate screen positions of blue cross vertices after rotation
  const offsetX = renderer.domElement.width / 10;
  const offsetY = renderer.domElement.height / 10;
  const offsetZ = 0;
  const screenPositionsBlue: { x: number, y: number }[] = [];
  for (let i = 0; i < originalPositions.length; i++) {
    const vertex = new THREE.Vector3(originalPositions[i].x, originalPositions[i].y, originalPositions[i].z);
    vertex.applyEuler(originalCross.rotation);
    vertex.project(camera);
    const screenX = ((vertex.x + 1) / 4) * renderer.domElement.width;
    const screenY = ((-vertex.y + 1) / 4) * renderer.domElement.height;
    screenPositionsBlue.push({ x: screenX, y: screenY });
  }

  // Calculate new vertex positions for green cross based on blue cross's screen positions
  const newPositions: { x: number, y: number, z: number }[] = [];
  for (let i = 0; i < position.count; i++) {
    const screenX = screenPositionsBlue[i % screenPositionsBlue.length].x;
    const screenY = screenPositionsBlue[i % screenPositionsBlue.length].y;
    let newX = (screenX - offsetX) / 100;
    let newY = (screenY - offsetY) / 100;
    let newZ = ((screenX * screenY)  - offsetZ) / 10000;
    newPositions.push({ x: newX, y: newY, z: newZ });
  }

  // Rebuild green STL geometry with new positions
  const positionGreen = stlGeometryDeformed.attributes.position;
  for (let i = 0; i < positionGreen.count; i++) {
    positionGreen.setXYZ(i, newPositions[i].x, newPositions[i].y, newPositions[i].z);
  }
  positionGreen.needsUpdate = true;

  // --- FIX: Rebuild green wireframe to match deformed mesh ---
if (cross && cross.children) {
  // Remove previous wireframe if present
  for (let i = cross.children.length - 1; i >= 0; i--) {
    const child = cross.children[i];
    if (child.type === 'LineSegments') {
      cross.remove(child);
    }
  }
  // Add updated wireframe
  const updatedWireframe = new THREE.LineSegments(
    new THREE.WireframeGeometry(stlGeometryDeformed),
    new THREE.LineBasicMaterial({ color: 0x00ff09 })
  );
  cross.add(updatedWireframe);
}
  // Move green cross to a new position (example: shift right by 1 unit)
  cross.position.set(-0.5, -0.5, -1.5);

  // Project 3D vertex positions to 2D screen coordinates
  let screenPositions: { x: number, y: number }[] = [];
  for (let i = 0; i < newPositions.length; i++) {
    const vertex = new THREE.Vector3(newPositions[i].x, newPositions[i].y, newPositions[i].z);
    vertex.project(camera);
    const screenX = ((vertex.x + 1) / 2) * renderer.domElement.width;
    const screenY = ((-vertex.y + 1) / 2) * renderer.domElement.height;
    screenPositions.push({ x: screenX, y: screenY });
  }

  // Update overlay in top left with blue cross screen coordinates only
 // overlayScreen.innerHTML = '<b>Blue STL (original) vertex 3D coordinates:</b><br>' +
    //screenPositionsBlue.map((p, idx) => `#${idx}: (${p.x.toFixed(1)}, ${p.y.toFixed(1)})`).join('<br>');
 //originalPositions.map((p, idx) => `#${idx}: (${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)})`).join('<br>');
  
 overlayScreen.innerHTML = '<b>Blue STL (org) vertex 3D pos:</b><br>' +
  originalPositions.map((p, idx) => {
    const v = new THREE.Vector3(p.x, p.y, p.z);
    if(originalCross)v.applyEuler(originalCross.rotation);
    return `#${idx}: (${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)})`;
  }).join('<br>');
 
 
 // Show only green cross 3D coordinates in top right
  overlay3d.innerHTML = '<b>Green STL (mod) vertex 3D coord:</b><br>' +
    newPositions.map((p, idx) => `#${idx}: (${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)})`).join('<br>');

  const center = new THREE.Vector3(0, 0, 0);
camera.position.x = cameraRadius * Math.sin(cameraAngleY) * Math.cos(cameraAngleX);
camera.position.y = cameraRadius * Math.sin(cameraAngleX);
camera.position.z = cameraRadius * Math.cos(cameraAngleY) * Math.cos(cameraAngleX);

// Apply roll (Z rotation) to camera
camera.up.set(0, 1, 0);
camera.up.applyAxisAngle(new THREE.Vector3(0, 0, 1), cameraAngleZ);


camera.lookAt(center);


  renderer.render(scene, camera);
}
animate();
}