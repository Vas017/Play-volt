import * as THREE from 'three';
export function upgradeVehicle(rider){
 const red=new THREE.MeshPhysicalMaterial({color:0xb91622,metalness:.62,roughness:.22,clearcoat:1,clearcoatRoughness:.16});
 const dark=new THREE.MeshStandardMaterial({color:0x080d14,metalness:.7,roughness:.28});
 const rubber=new THREE.MeshStandardMaterial({color:0x030609,roughness:.92});
 const glow=new THREE.MeshStandardMaterial({color:0x7cf7ff,emissive:0x20dfff,emissiveIntensity:5,metalness:.2,roughness:.16});
 const suit=new THREE.MeshStandardMaterial({color:0x121b28,roughness:.42,metalness:.18});
 const accent=new THREE.MeshStandardMaterial({color:0xe63b2e,roughness:.35,metalness:.2});
 const rig=new THREE.Group();rider.add(rig);
 // Sculpted side fairings and nose break up the old box silhouette.
 for(const x of[-.86,.86]){const f=new THREE.Mesh(new THREE.CapsuleGeometry(.34,1.75,6,12),red);f.scale.set(.78,.72,1);f.rotation.x=Math.PI/2;f.rotation.z=x<0?-.09:.09;f.position.set(x,.88,-.55);f.castShadow=true;rig.add(f)}
 const nose=new THREE.Mesh(new THREE.ConeGeometry(.72,2.3,10),red);nose.rotation.x=Math.PI/2;nose.position.set(0,1.05,-2.05);nose.scale.set(1,.75,1);rig.add(nose);
 const bumper=new THREE.Mesh(new THREE.TorusGeometry(.83,.08,8,20,Math.PI),dark);bumper.rotation.set(Math.PI/2,0,Math.PI);bumper.position.set(0,.55,-2.62);rig.add(bumper);
 // Articulated ski assemblies.
 const skis=[];for(const x of[-1.02,1.02]){const pivot=new THREE.Group();pivot.position.set(x,.32,-.72);const ski=new THREE.Mesh(new THREE.CapsuleGeometry(.1,2.9,5,10),dark);ski.rotation.x=Math.PI/2;ski.scale.set(1,.25,1);pivot.add(ski);const blade=new THREE.Mesh(new THREE.BoxGeometry(.06,.08,3.1),glow);blade.position.y=-.08;pivot.add(blade);const strut=new THREE.Mesh(new THREE.CylinderGeometry(.055,.075,.9,8),dark);strut.position.set(-x*.16,.47,.1);strut.rotation.z=x<0?-.28:.28;pivot.add(strut);rig.add(pivot);skis.push(pivot)}
 // Rear track housing + visible wheels.
 const trackGroup=new THREE.Group();trackGroup.position.set(0,.42,1.05);const belt=new THREE.Mesh(new THREE.BoxGeometry(1.5,.42,2.7),rubber);trackGroup.add(belt);for(const z of[-.85,0,.85])for(const x of[-.58,.58]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.13,14),dark);wheel.rotation.z=Math.PI/2;wheel.position.set(x,-.05,z);trackGroup.add(wheel)}rig.add(trackGroup);
 // Handlebar and articulated rider limbs.
 const bar=new THREE.Group();bar.position.set(0,1.55,-.55);const stem=new THREE.Mesh(new THREE.CylinderGeometry(.045,.06,.72,8),dark);stem.rotation.x=-.28;bar.add(stem);const handle=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,1.65,8),dark);handle.rotation.z=Math.PI/2;handle.position.set(0,.34,-.1);bar.add(handle);rig.add(bar);
 const body=new THREE.Group();body.position.set(0,1.8,.12);const chest=new THREE.Mesh(new THREE.CapsuleGeometry(.44,1.05,8,14),suit);chest.rotation.x=-.24;body.add(chest);const vest=new THREE.Mesh(new THREE.BoxGeometry(.76,.72,.18),accent);vest.position.set(0,.1,-.4);vest.rotation.x=-.24;body.add(vest);
 const arms=[];for(const x of[-1,1]){const arm=new THREE.Group();arm.position.set(x*.42,.32,-.05);const upper=new THREE.Mesh(new THREE.CapsuleGeometry(.11,.62,5,8),suit);upper.rotation.z=x*.52;upper.rotation.x=-.55;arm.add(upper);const glove=new THREE.Mesh(new THREE.SphereGeometry(.14,10,8),dark);glove.position.set(x*.32,-.18,-.38);arm.add(glove);body.add(arm);arms.push(arm)}
 const legs=[];for(const x of[-1,1]){const leg=new THREE.Group();leg.position.set(x*.28,-.62,.28);const limb=new THREE.Mesh(new THREE.CapsuleGeometry(.14,.75,5,8),suit);limb.rotation.x=.62;limb.rotation.z=-x*.12;leg.add(limb);const boot=new THREE.Mesh(new THREE.BoxGeometry(.3,.22,.55),dark);boot.position.set(x*.03,-.24,.55);leg.add(boot);body.add(leg);legs.push(leg)}rig.add(body);
 const helmetRig=new THREE.Group();helmetRig.position.set(0,2.92,-.12);const helmet=new THREE.Mesh(new THREE.SphereGeometry(.57,24,18),dark);helmetRig.add(helmet);const visor=new THREE.Mesh(new THREE.SphereGeometry(.585,24,12,Math.PI*.16,Math.PI*.68,Math.PI*.28,Math.PI*.28),new THREE.MeshPhysicalMaterial({color:0x54eaff,emissive:0x087f98,emissiveIntensity:1.4,metalness:.35,roughness:.08,transparent:true,opacity:.82,clearcoat:1}));visor.rotation.y=-Math.PI/2;helmetRig.add(visor);rig.add(helmetRig);
 const tail=new THREE.Mesh(new THREE.BoxGeometry(.82,.09,.12),glow);tail.position.set(0,.72,2.12);rig.add(tail);
 return {rig,skis,bar,body,arms,legs,helmetRig,trackGroup,animate({steer,boost,airborne,time}){const s=THREE.MathUtils.clamp(steer,-1,1);skis.forEach(p=>p.rotation.y=-s*.34);bar.rotation.y=-s*.24;body.rotation.z=-s*.13;body.rotation.x=(boost?-.11:0)+(airborne?.05:0);helmetRig.rotation.z=-s*.06;arms[0].rotation.z=s*.08;arms[1].rotation.z=s*.08;trackGroup.position.y=.42+Math.sin(time*.022)*(boost?.035:.018);rig.position.y=Math.sin(time*.015)*(airborne?0:.018);tail.material.emissiveIntensity=boost?8:5;}};
}
