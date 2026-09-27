import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const ASSET = {
  snowmobile: 'https://cdn.3dassets.dev/assets/28491/v1/model.glb',
  village: 'https://cdn.3dassets.dev/assets/19850/v1/model.glb',
  rider: 'https://cdn.3dassets.dev/assets/18919/v1/model.glb',
  ramp: 'https://cdn.3dassets.dev/assets/25972/v1/model.glb'
};

const $ = (id) => document.getElementById(id);
const ui = {
  loading: $('loading'), loadFill: $('loadFill'), loadText: $('loadText'), start: $('startScreen'),
  ride: $('rideButton'), hud: $('hudTop'), speedCard: $('speedCard'), controls: $('controls'),
  speed: $('speedText'), energy: $('energyFill'), volt: $('voltText'), ramps: $('rampText'),
  distance: $('distanceText'), trick: $('trick'), toast: $('toast'), jump: $('jumpButton'), boost: $('boostButton')
};

const app = $('game');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x071a2d, 0.0135);
const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 4.1, 9.4);

const hemi = new THREE.HemisphereLight(0x9cecff, 0x09203a, 2.15);
scene.add(hemi);
const moon = new THREE.DirectionalLight(0xc8efff, 3.5);
moon.position.set(-8, 20, 8);
moon.castShadow = true;
moon.shadow.mapSize.set(1024, 1024);
moon.shadow.camera.left = -28; moon.shadow.camera.right = 28; moon.shadow.camera.top = 36; moon.shadow.camera.bottom = -12;
scene.add(moon);
const rim = new THREE.DirectionalLight(0x32f0ff, 2.8);
rim.position.set(11, 6, -14);
scene.add(rim);

const warm = new THREE.PointLight(0xffc46b, 18, 46, 2);
warm.position.set(-18, 6, -45);
scene.add(warm);

const state = {
  running: false, speed: 0, targetSpeed: 0, x: 0, steer: 0, boost: false, energy: 100,
  distance: 0, volt: 0, ramps: 0, airborne: false, vy: 0, y: 0.22, airStart: 0,
  pointerDown: false, pointerStartX: 0, pointerLastX: 0, lastToast: 0
};

const world = new THREE.Group();
scene.add(world);
const player = new THREE.Group();
player.position.set(0, state.y, 2.6);
scene.add(player);

function snowTexture(){
  const c=document.createElement('canvas'); c.width=c.height=512; const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,512,512); g.addColorStop(0,'#dff8ff'); g.addColorStop(.45,'#bfe5f2'); g.addColorStop(1,'#ecfbff'); x.fillStyle=g; x.fillRect(0,0,512,512);
  for(let i=0;i<950;i++){ const a=Math.random()*.11; x.fillStyle=`rgba(20,84,118,${a})`; const r=Math.random()*2+.3; x.beginPath(); x.arc(Math.random()*512,Math.random()*512,r,0,Math.PI*2); x.fill(); }
  x.strokeStyle='rgba(90,160,184,.16)'; x.lineWidth=2;
  for(let k=0;k<18;k++){ const px=60+k*23; x.beginPath(); x.moveTo(px,0); x.lineTo(px-8,512); x.stroke(); }
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(2.8,2.2); t.anisotropy=4; return t;
}
const trackMat = new THREE.MeshStandardMaterial({ map:snowTexture(), color:0xdff7ff, roughness:.82, metalness:.04 });
const iceMat = new THREE.MeshPhysicalMaterial({ color:0x52b9d9, roughness:.18, metalness:.18, transmission:.12, transparent:true, opacity:.83 });

const trackSegments=[];
for(let i=0;i<18;i++){
  const m=new THREE.Mesh(new THREE.PlaneGeometry(18,25),trackMat); m.rotation.x=-Math.PI/2; m.receiveShadow=true; m.position.set(0,-.03,8-i*24.7); world.add(m); trackSegments.push(m);
  if(i%4===2){ const ice=new THREE.Mesh(new THREE.PlaneGeometry(13,8),iceMat); ice.rotation.x=-Math.PI/2; ice.position.set((i%8===2?-1.2:1.2),.015,m.position.z-4); world.add(ice); trackSegments.push(ice); ice.userData.overlay=true; }
}

// Snowbanks give the track volume; hero architecture comes from imported GLB assets.
const bankMat=new THREE.MeshStandardMaterial({color:0xcdefff,roughness:.95});
for(let i=0;i<24;i++){
  const z=2-i*19;
  [-1,1].forEach(side=>{ const bank=new THREE.Mesh(new THREE.DodecahedronGeometry(3.4+Math.random()*2,2),bankMat); bank.scale.set(1.7,.58,2.1); bank.position.set(side*(11.4+Math.random()*3),1.0+Math.random()*.35,z+Math.random()*7); bank.rotation.set(Math.random()*.15,Math.random()*Math.PI,.05*side); bank.receiveShadow=bank.castShadow=true; world.add(bank); bank.userData.scroll=true; });
}

const snowGeo=new THREE.BufferGeometry(); const snowCount=900; const snowPos=new Float32Array(snowCount*3);
for(let i=0;i<snowCount;i++){ snowPos[i*3]=(Math.random()-.5)*55; snowPos[i*3+1]=Math.random()*20; snowPos[i*3+2]=-Math.random()*115+15; }
snowGeo.setAttribute('position',new THREE.BufferAttribute(snowPos,3));
const snow=new THREE.Points(snowGeo,new THREE.PointsMaterial({color:0xe8fbff,size:.085,transparent:true,opacity:.85,depthWrite:false})); scene.add(snow);

const speedGeo=new THREE.BufferGeometry(); const speedN=90; const speedPos=new Float32Array(speedN*6);
for(let i=0;i<speedN;i++){ const x=(Math.random()-.5)*22,y=Math.random()*8,z=-Math.random()*50; speedPos.set([x,y,z,x,y,z+1.8+Math.random()*3],i*6); }
speedGeo.setAttribute('position',new THREE.BufferAttribute(speedPos,3));
const speedLines=new THREE.LineSegments(speedGeo,new THREE.LineBasicMaterial({color:0x9ff8ff,transparent:true,opacity:0,depthWrite:false})); scene.add(speedLines);

const powderGeo=new THREE.BufferGeometry(); const pN=140; const powderPos=new Float32Array(pN*3); const powderVel=[];
for(let i=0;i<pN;i++){ powderPos.set([0,0,0],i*3); powderVel.push(new THREE.Vector3()); }
powderGeo.setAttribute('position',new THREE.BufferAttribute(powderPos,3));
const powder=new THREE.Points(powderGeo,new THREE.PointsMaterial({color:0xe9fbff,size:.12,transparent:true,opacity:.7,depthWrite:false})); scene.add(powder);

function resetPowder(i){
  powderPos[i*3]=player.position.x+(Math.random()-.5)*1.2; powderPos[i*3+1]=.1+Math.random()*.25; powderPos[i*3+2]=player.position.z+.9+Math.random()*.8;
  powderVel[i].set((Math.random()-.5)*.025,.018+Math.random()*.04,.05+Math.random()*.08);
}
for(let i=0;i<pN;i++) resetPowder(i);

const gltf = new GLTFLoader();
let snowmobileVisual=null, riderVisual=null, villageA=null, villageB=null, rampTemplate=null;
let loaded=0; const loadTotal=4;
function progress(label){ loaded++; ui.loadText.textContent=label; ui.loadFill.style.width=`${Math.min(100,12+loaded/loadTotal*88)}%`; if(loaded>=loadTotal) setTimeout(showStart,350); }
function prepModel(root){ root.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; if(o.material){ const mats=Array.isArray(o.material)?o.material:[o.material]; mats.forEach(m=>{ if('envMapIntensity' in m)m.envMapIntensity=1.2; }); } } }); return root; }

function loadSnowmobile(){
  gltf.load(ASSET.snowmobile,g=>{
    snowmobileVisual=prepModel(g.scene); snowmobileVisual.rotation.y=Math.PI; snowmobileVisual.position.set(0,.08,0); snowmobileVisual.scale.setScalar(1.02); player.add(snowmobileVisual);
    const glow=new THREE.PointLight(0x28eaff,8,9,2); glow.position.set(0,.58,-1.2); player.add(glow); progress('Snowmobile ready');
  },undefined,()=>{ progress('Snowmobile asset unavailable — continuing'); });
}
function loadRider(){
  gltf.load(ASSET.rider,g=>{
    riderVisual=prepModel(g.scene); riderVisual.traverse(o=>{ if(/board|binding|pack/i.test(o.name)) o.visible=false; });
    riderVisual.rotation.y=Math.PI; riderVisual.scale.setScalar(.72); riderVisual.position.set(0,.74,.05); player.add(riderVisual); progress('Winter rider ready');
  },undefined,()=>{ progress('Rider asset unavailable — continuing'); });
}
function loadVillage(){
  gltf.load(ASSET.village,g=>{
    villageA=prepModel(g.scene); villageA.scale.setScalar(.82); villageA.position.set(-24,-.3,-88); villageA.rotation.y=.09; world.add(villageA);
    villageB=villageA.clone(true); villageB.position.set(24,-.3,-235); villageB.rotation.y=Math.PI+.08; world.add(villageB);
    villageA.userData.village=villageB.userData.village=true; progress('Alpine village ready');
  },undefined,()=>{ progress('Village asset unavailable — continuing'); });
}
function loadRamp(){
  gltf.load(ASSET.ramp,g=>{ rampTemplate=prepModel(g.scene); rampTemplate.rotation.y=Math.PI; rampTemplate.scale.setScalar(.82); buildRamps(); progress('Snow park ready'); },undefined,()=>{ buildFallbackRamps(); progress('Ramp asset unavailable — continuing'); });
}

const ramps=[];
function addRamp(obj,x,z){ const wrap=new THREE.Group(); wrap.add(obj); wrap.position.set(x,0,z); wrap.userData={type:'ramp',hit:false}; world.add(wrap); ramps.push(wrap); }
function buildRamps(){ [[-2,-48],[2.5,-118],[-2.2,-188],[1.5,-265],[0,-340]].forEach(([x,z])=>addRamp(rampTemplate.clone(true),x,z)); }
function buildFallbackRamps(){
  const mat=new THREE.MeshStandardMaterial({color:0xdff8ff,roughness:.83});
  [[-2,-48],[2.5,-118],[-2.2,-188],[1.5,-265],[0,-340]].forEach(([x,z])=>{ const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute([-2.4,0,4,2.4,0,4,-2.4,0,-4,2.4,0,-4,-2.4,2,-4,2.4,2,-4],3)); geo.setIndex([0,1,2,1,3,2,2,3,4,3,5,4,0,2,4,0,4,1,1,4,5,1,5,3]); geo.computeVertexNormals(); addRamp(new THREE.Mesh(geo,mat),x,z); });
}

const volts=[];
const voltMat=new THREE.MeshStandardMaterial({color:0x68f8ff,emissive:0x00c7ff,emissiveIntensity:5,metalness:.28,roughness:.18});
function createVolt(x,z){
  const g=new THREE.Group(); const ring=new THREE.Mesh(new THREE.TorusGeometry(.46,.12,12,28),voltMat); ring.rotation.y=Math.PI/2; g.add(ring);
  const boltShape=new THREE.Shape(); boltShape.moveTo(.05,.52); boltShape.lineTo(-.22,.06); boltShape.lineTo(.02,.06); boltShape.lineTo(-.08,-.48); boltShape.lineTo(.31,.09); boltShape.lineTo(.07,.09); boltShape.closePath();
  const bolt=new THREE.Mesh(new THREE.ExtrudeGeometry(boltShape,{depth:.07,bevelEnabled:true,bevelSize:.02,bevelThickness:.02}),new THREE.MeshBasicMaterial({color:0xeaffff})); bolt.position.z=-.04; g.add(bolt);
  const light=new THREE.PointLight(0x19dcff,5,4,2); g.add(light); g.position.set(x,1.25,z); g.userData={type:'volt',taken:false}; world.add(g); volts.push(g);
}
for(let i=0;i<28;i++){ const lane=[-4.2,0,4.2][i%3]; createVolt(lane+Math.sin(i*.83)*.7,-28-i*13.2); }

// Race pylons, lamps and lightning banners give the course a deliberate arcade silhouette.
const courseProps=[];
const poleMat=new THREE.MeshStandardMaterial({color:0x193245,metalness:.7,roughness:.35});
const bannerMat=new THREE.MeshStandardMaterial({color:0x12375d,emissive:0x0b7da0,emissiveIntensity:.65,roughness:.55});
for(let i=0;i<18;i++){
  const z=-12-i*24;
  [-1,1].forEach(side=>{
    const g=new THREE.Group(); const pole=new THREE.Mesh(new THREE.CylinderGeometry(.07,.1,3.4,10),poleMat); pole.position.y=1.7; g.add(pole);
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(.16,10,8),new THREE.MeshBasicMaterial({color:0xffdb91})); lamp.position.set(0,3.25,0); g.add(lamp);
    const b=new THREE.Mesh(new THREE.PlaneGeometry(.75,1.15),bannerMat); b.position.set(-side*.46,2.15,0); b.rotation.y=side*Math.PI/2; g.add(b);
    g.position.set(side*9.2,0,z); g.userData.scroll=true; world.add(g); courseProps.push(g);
  });
}

function showStart(){ ui.loading.classList.add('hidden'); ui.start.classList.remove('hidden'); }
loadSnowmobile(); loadRider(); loadVillage(); loadRamp();

function begin(){
  state.running=true; state.targetSpeed=92; ui.start.classList.add('hidden'); ui.hud.classList.remove('hidden'); ui.speedCard.classList.remove('hidden'); ui.controls.classList.remove('hidden');
}
ui.ride.addEventListener('click',begin);

function jump(){ if(!state.running||state.airborne)return; state.airborne=true; state.vy=.135; state.airStart=performance.now(); ui.jump.classList.add('pressed'); setTimeout(()=>ui.jump.classList.remove('pressed'),120); }
ui.jump.addEventListener('pointerdown',e=>{e.preventDefault();jump();});
function boostOn(e){e?.preventDefault(); if(!state.running)return; state.boost=true; ui.boost.classList.add('pressed');}
function boostOff(){state.boost=false;ui.boost.classList.remove('pressed');}
ui.boost.addEventListener('pointerdown',boostOn); ui.boost.addEventListener('pointerup',boostOff); ui.boost.addEventListener('pointercancel',boostOff); ui.boost.addEventListener('pointerleave',boostOff);

window.addEventListener('keydown',e=>{ if(['ArrowLeft','a','A'].includes(e.key))state.steer=-1; if(['ArrowRight','d','D'].includes(e.key))state.steer=1; if(e.code==='Space')boostOn(); if(['ArrowUp','w','W'].includes(e.key))jump(); });
window.addEventListener('keyup',e=>{ if(['ArrowLeft','ArrowRight','a','A','d','D'].includes(e.key))state.steer=0; if(e.code==='Space')boostOff(); });
renderer.domElement.addEventListener('pointerdown',e=>{ state.pointerDown=true; state.pointerStartX=state.pointerLastX=e.clientX; });
window.addEventListener('pointermove',e=>{ if(!state.pointerDown||!state.running)return; const dx=e.clientX-state.pointerLastX; state.pointerLastX=e.clientX; state.steer=THREE.MathUtils.clamp(dx/22,-1,1); });
window.addEventListener('pointerup',()=>{state.pointerDown=false;state.steer*=.25;});

function toast(text){ ui.toast.textContent=text; ui.toast.classList.remove('hidden'); state.lastToast=performance.now(); }
function updateObjects(dt,move){
  trackSegments.forEach(o=>{ o.position.z+=move; if(o.position.z>21)o.position.z-=18*24.7; });
  world.children.forEach(o=>{ if(o.userData.scroll){o.position.z+=move;if(o.position.z>28)o.position.z-=460;} });
  if(villageA){ [villageA,villageB].forEach(v=>{v.position.z+=move*.62;if(v.position.z>70)v.position.z-=350;}); }
  ramps.forEach(r=>{ r.position.z+=move; if(r.position.z>22){r.position.z-=370;r.userData.hit=false;} const dz=Math.abs(r.position.z-player.position.z); if(!r.userData.hit&&dz<4.2&&Math.abs(r.position.x-player.position.x)<3.7){r.userData.hit=true; state.ramps++; if(!state.airborne){state.airborne=true;state.vy=.17;state.airStart=performance.now();} toast('RAMP LAUNCH');} });
  volts.forEach((v,i)=>{ v.position.z+=move; v.rotation.y+=dt*2.7; v.position.y=1.25+Math.sin(performance.now()*.003+i)*.16; if(v.position.z>18){v.position.z-=390;v.userData.taken=false;v.visible=true;} if(!v.userData.taken&&Math.abs(v.position.z-player.position.z)<1.35&&Math.abs(v.position.x-player.position.x)<1.25){v.userData.taken=true;v.visible=false;state.volt++;state.energy=Math.min(100,state.energy+18);toast('⚡ VOLT CHARGED');} });
}

function updateSnow(dt){
  const p=snow.geometry.attributes.position.array; const fall=.8+state.speed/95*1.7;
  for(let i=0;i<snowCount;i++){p[i*3+1]-=dt*fall;p[i*3+2]+=dt*(3+state.speed*.08);if(p[i*3+1]<-.2||p[i*3+2]>18){p[i*3]=(Math.random()-.5)*55;p[i*3+1]=10+Math.random()*12;p[i*3+2]=-95-Math.random()*20;}} snow.geometry.attributes.position.needsUpdate=true;
  for(let i=0;i<pN;i++){ powderPos[i*3]+=powderVel[i].x*(state.speed*.03+1); powderPos[i*3+1]+=powderVel[i].y*(state.speed*.018+1); powderPos[i*3+2]+=powderVel[i].z*(state.speed*.035+1); if(powderPos[i*3+1]>2.1||powderPos[i*3+2]>player.position.z+5)resetPowder(i); } powder.geometry.attributes.position.needsUpdate=true;
}

function updatePlayer(dt){
  const boosting=state.boost&&state.energy>0; state.targetSpeed=boosting?148:96; state.speed=THREE.MathUtils.lerp(state.speed,state.targetSpeed,1-Math.pow(.001,dt));
  if(boosting)state.energy=Math.max(0,state.energy-dt*20); else state.energy=Math.min(100,state.energy+dt*6.5);
  state.x=THREE.MathUtils.clamp(state.x+state.steer*dt*(6.6+state.speed*.018),-6.5,6.5); if(!state.pointerDown)state.steer*=Math.pow(.035,dt);
  if(state.airborne){ state.vy-=dt*.255; state.y+=state.vy*dt*60; if(state.y<=.22){ const airtime=(performance.now()-state.airStart)/1000; state.y=.22;state.vy=0;state.airborne=false;ui.trick.classList.add('hidden'); if(airtime>.45)toast(`LANDING +${Math.round(airtime*420)}`); } else { const air=(performance.now()-state.airStart)/1000; ui.trick.textContent=`AIR +${Math.round(air*420)}`;ui.trick.classList.remove('hidden'); } }
  player.position.x=THREE.MathUtils.lerp(player.position.x,state.x,.14); player.position.y=state.y; player.rotation.z=THREE.MathUtils.lerp(player.rotation.z,-state.steer*.18,.12); player.rotation.x=THREE.MathUtils.lerp(player.rotation.x,state.airborne?-.06:0,.08);
  if(riderVisual){ riderVisual.rotation.z=THREE.MathUtils.lerp(riderVisual.rotation.z,state.steer*.12,.09); riderVisual.position.y=.74+(boosting?-.035:0); }
  speedLines.material.opacity=THREE.MathUtils.lerp(speedLines.material.opacity,boosting?.54:.03,.1);
  camera.fov=THREE.MathUtils.lerp(camera.fov,boosting?67:58,.055); camera.updateProjectionMatrix();
  const camX=player.position.x*.28; camera.position.x=THREE.MathUtils.lerp(camera.position.x,camX,.05); camera.position.y=THREE.MathUtils.lerp(camera.position.y,state.airborne?4.65:4.1,.045); camera.position.z=THREE.MathUtils.lerp(camera.position.z,boosting?10.15:9.4,.045); camera.lookAt(player.position.x*.2,1.05,-8.5);
  state.distance+=state.speed*dt/3.6;
}

function updateUI(){ ui.speed.textContent=Math.round(state.speed); ui.energy.style.width=`${state.energy}%`; ui.volt.textContent=`${state.volt} / 12`; ui.ramps.textContent=`${state.ramps} / 5`; ui.distance.textContent=`${Math.min(2500,Math.round(state.distance))} / 2500 m`; if(performance.now()-state.lastToast>1100)ui.toast.classList.add('hidden'); }

const clock=new THREE.Clock();
function frame(){ requestAnimationFrame(frame); const dt=Math.min(.033,clock.getDelta());
  if(state.running){ updatePlayer(dt); const move=state.speed*dt*.105; updateObjects(dt,move); updateSnow(dt); updateUI(); warm.intensity=13+Math.sin(performance.now()*.0015)*4; }
  else { player.rotation.y=Math.sin(performance.now()*.00045)*.05; updateSnow(dt*.35); }
  renderer.render(scene,camera);
}
frame();

addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));});
