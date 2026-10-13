import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
function Object3D() {
  const ref = useRef();
  useFrame((_,delta) => { ref.current.rotation.y += delta * .25; });
  return <mesh ref={ref}><torusKnotGeometry args={[1,.25,96,12]} /><meshStandardMaterial color="#145c5b" roughness={.5} /></mesh>;
}
export default function Scene() {
  return <div aria-hidden="true" style={{height:320}}><Canvas dpr={[1,1.5]} camera={{position:[0,0,5]}}><ambientLight intensity={1.5}/><directionalLight position={[3,3,3]}/><Object3D/></Canvas></div>;
}
