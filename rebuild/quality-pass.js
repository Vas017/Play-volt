// PLAY-VOLT cinematic quality pass. Loaded after game.js during rebuild testing.
import * as THREE from 'three';
// Asset-ready manifest: these slots are intentionally separated from gameplay so GLB/PBR assets
// can replace proxy geometry without rewriting steering, missions, collisions or progression.
export const visualTarget={
 environment:['hero alpine skyline','fortress village','ice canyon','waterfall basin','pine corridor'],
 vehicle:['snowmobile chassis','articulated skis','track assembly','rider rig','helmet visor'],
 fx:['aurora ribbons','powder spray','speed streaks','landing burst','waterfall mist','orb bloom'],
 materials:['packed snow','blue ice','wet rock','painted metal','glass visor','warm windows']
};
export function installCinematicPass({scene,camera,renderer,rider,world}){
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.22;
 scene.fog=new THREE.FogExp2(0x315f7d,.0085);
 const rim=new THREE.DirectionalLight(0x7deaff,2.2);rim.position.set(18,16,8);scene.add(rim);
 const key=new THREE.DirectionalLight(0xffe6c2,1.8);key.position.set(-14,22,-18);scene.add(key);
 const fill=new THREE.PointLight(0x16dfff,18,55);fill.position.set(0,8,-20);scene.add(fill);
 // Layered translucent aurora planes create distant parallax instead of a flat sky color.
 const auroraMat=(c,o)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending});
 [[0x35ffd0,.10,-75,27],[0x4ac8ff,.08,-105,31],[0xa65cff,.055,-140,34]].forEach(([c,o,z,y],i)=>{const q=new THREE.Mesh(new THREE.PlaneGeometry(110,13,24,2),auroraMat(c,o));q.position.set(i%2?8:-8,y,z);q.rotation.x=-.12;q.rotation.z=(i-1)*.05;scene.add(q)});
 // Powder cloud anchored to the machine gives acceleration and landing weight.
 const n=220,g=new THREE.BufferGeometry(),a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=(Math.random()-.5)*3;a[i*3+1]=Math.random()*1.2;a[i*3+2]=1+Math.random()*5}g.setAttribute('position',new THREE.BufferAttribute(a,3));const powder=new THREE.Points(g,new THREE.PointsMaterial({color:0xdff8ff,size:.11,transparent:true,opacity:.55,depthWrite:false}));rider.add(powder);
 // Headlight cone substitutes for a costly volumetric pass on mobile.
 const beam=new THREE.Mesh(new THREE.ConeGeometry(3.8,18,24,1,true),new THREE.MeshBasicMaterial({color:0x74efff,transparent:true,opacity:.035,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));beam.rotation.x=-Math.PI/2;beam.position.set(0,1.15,-9);rider.add(beam);
 // Track-side illuminated pylons improve speed/depth read and make the course feel authored.
 const pylonMat=new THREE.MeshStandardMaterial({color:0x173047,metalness:.72,roughness:.25});const stripMat=new THREE.MeshStandardMaterial({color:0x65f5ff,emissive:0x22dfff,emissiveIntensity:4});
 for(let z=-35;z>-430;z-=34)for(const x of[-5.4,5.4]){const g=new THREE.Group();const p=new THREE.Mesh(new THREE.CylinderGeometry(.08,.14,2.7,8),pylonMat);p.position.y=1.35;g.add(p);const s=new THREE.Mesh(new THREE.BoxGeometry(.12,1.8,.12),stripMat);s.position.set(0,1.65,.05);g.add(s);g.position.set(x,0,z);world.add(g)}
 // Camera composition is intentionally low and close for the reference's console-racer feel.
 camera.fov=62;camera.updateProjectionMatrix();
 return {powder,beam};
}
