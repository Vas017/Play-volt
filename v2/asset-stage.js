import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const app=document.getElementById('app'),loading=document.getElementById('loading'),controlsEl=document.getElementById('controls'),nameEl=document.getElementById('assetName'),metaEl=document.getElementById('assetMeta');
const scene=new THREE.Scene();scene.background=new THREE.Color(0x061227);scene.fog=new THREE.Fog(0x102a45,18,65);
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,200);camera.position.set(5.4,3.7,8.2);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;renderer.outputColorSpace=THREE.SRGBColorSpace;app.appendChild(renderer.domElement);
const orbit=new OrbitControls(camera,renderer.domElement);orbit.enableDamping=true;orbit.target.set(0,1,0);orbit.minDistance=2.2;orbit.maxDistance=22;
scene.add(new THREE.HemisphereLight(0xbcecff,0x06101a,2.8));const key=new THREE.DirectionalLight(0xffffff,4);key.position.set(-6,10,7);key.castShadow=true;scene.add(key);const rim=new THREE.DirectionalLight(0x52e8ff,2.3);rim.position.set(8,5,-5);scene.add(rim);const warm=new THREE.PointLight(0xffa745,18,20);warm.position.set(-3,3,4);scene.add(warm);
const floor=new THREE.Mesh(new THREE.CircleGeometry(16,96),new THREE.MeshPhysicalMaterial({color:0x9dd8e8,roughness:.28,metalness:.05,clearcoat:1}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
const grid=new THREE.GridHelper(24,24,0x50e8ff,0x17364c);grid.position.y=.012;grid.material.transparent=true;grid.material.opacity=.22;scene.add(grid);
const loader=new GLTFLoader();let active=null,mixer=null,clock=new THREE.Clock();

const ASSETS=[
 {id:'snowmobile',label:'Snowmobile',type:'vehicle',url:'https://cdn.3dassets.dev/assets/26005/v1/model.glb',scale:1.8,rotY:Math.PI},
 {id:'rider',label:'Rider',type:'character',url:'https://raw.githubusercontent.com/Mesh2Motion/mesh2motion-app/main/static/models/model-human.glb',scale:1.45,rotY:Math.PI},
 {id:'spruce',label:'Snow Spruce',type:'environment',url:'https://cdn.3dassets.dev/assets/10360/v1/model.glb',scale:2.2},
 {id:'icecliff',label:'Ice Cliff',type:'environment',url:'https://cdn.3dassets.dev/assets/10317/v1/model.glb',scale:2.1},
 {id:'waterfall',label:'Frozen Waterfall',type:'environment',url:'https://cdn.3dassets.dev/assets/10319/v1/model.glb',scale:2.2},
 {id:'chalet',label:'Alpine Chalet',type:'village',url:'https://cdn.3dassets.dev/assets/10277/v1/model.glb',scale:1.6},
 {id:'bridge',label:'Timber Bridge',type:'village',url:'https://cdn.3dassets.dev/assets/10273/v1/model.glb',scale:1.8},
 {id:'snowpark',label:'Snow Park Ramp',type:'ramp',url:'https://cdn.3dassets.dev/assets/25868/v1/model.glb',scale:1.9},
 {id:'coin',label:'Collectible',type:'collectible',url:'https://cdn.3dassets.dev/assets/25079/v1/model.glb',scale:1.7}
];

function normalize(root,scale=1){const box=new THREE.Box3().setFromObject(root),size=new THREE.Vector3(),center=new THREE.Vector3();box.getSize(size);box.getCenter(center);const max=Math.max(size.x,size.y,size.z)||1;root.scale.setScalar((4.5/max)*scale);root.position.sub(center.multiplyScalar(root.scale.x));const b2=new THREE.Box3().setFromObject(root);root.position.y-=b2.min.y;}
function styleModel(root){root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.material){o.material.envMapIntensity=.9;o.material.needsUpdate=true}}});}
function showAsset(a,btn){document.querySelectorAll('.asset').forEach(b=>b.classList.remove('active'));if(btn)btn.classList.add('active');loading.classList.remove('hidden');nameEl.textContent=a.label;metaEl.textContent=`${a.type.toUpperCase()} • GLB/GLTF REVIEW`;if(active){scene.remove(active);active.traverse?.(o=>{if(o.geometry)o.geometry.dispose?.()});active=null}mixer=null;
 loader.load(a.url,gltf=>{active=gltf.scene;styleModel(active);normalize(active,a.scale||1);active.rotation.y=a.rotY||0;scene.add(active);if(gltf.animations?.length){mixer=new THREE.AnimationMixer(active);gltf.animations.slice(0,1).forEach(c=>mixer.clipAction(c).play())}const box=new THREE.Box3().setFromObject(active),size=new THREE.Vector3();box.getSize(size);const r=Math.max(size.x,size.y,size.z);orbit.target.set(0,Math.max(.8,size.y*.38),0);camera.position.set(r*1.35,r*.78,r*1.55);orbit.update();loading.classList.add('hidden')},undefined,err=>{console.error(err);loading.textContent='ASSET FAILED TO LOAD';metaEl.textContent='Check remote model URL / CORS';setTimeout(()=>{loading.classList.add('hidden');loading.textContent='LOADING REAL GLB ASSET…'},1600)});
}
ASSETS.forEach((a,i)=>{const b=document.createElement('button');b.className='asset';b.innerHTML=`${a.label}<small>${a.type}</small>`;b.onclick=()=>showAsset(a,b);controlsEl.appendChild(b);if(i===0)setTimeout(()=>showAsset(a,b),80)});

function loop(){requestAnimationFrame(loop);const dt=clock.getDelta();mixer?.update(dt);if(active)active.rotation.y+=.0015;orbit.update();renderer.render(scene,camera)}loop();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
