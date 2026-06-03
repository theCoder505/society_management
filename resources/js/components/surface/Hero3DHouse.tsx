import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ModernHouse() {
    const group = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (group.current) {
            group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
        }
    });

    return (
        <group ref={group} dispose={null} position={[0, -0.5, 0]}>
            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
                {/* Base platform */}
                <mesh position={[0, -0.1, 0]} castShadow receiveShadow>
                    <boxGeometry args={[5.5, 0.2, 4.5]} />
                    <meshStandardMaterial color="#E2DFD4" />
                </mesh>

                {/* Main Building Block */}
                <mesh position={[0, 1, -0.5]} castShadow receiveShadow>
                    <boxGeometry args={[3.8, 2, 2.5]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.1} />
                </mesh>

                {/* Second Floor/Accent */}
                <mesh position={[-0.4, 2.5, -0.2]} castShadow receiveShadow>
                    <boxGeometry args={[3, 1, 2.5]} />
                    <meshStandardMaterial color="#2E5A28" roughness={0.8} />
                </mesh>

                {/* Roof extension / Overhang */}
                <mesh position={[-0.4, 3.05, 0.3]} castShadow receiveShadow>
                    <boxGeometry args={[3.2, 0.1, 1.5]} />
                    <meshStandardMaterial color="#1C2B1A" roughness={0.9} />
                </mesh>

                {/* Glass Window large */}
                <mesh position={[0.5, 1, 0.76]} castShadow receiveShadow>
                    <boxGeometry args={[2.2, 1.6, 0.1]} />
                    <MeshDistortMaterial color="#A8C09A" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.9} roughness={0.1} />
                </mesh>

                {/* Glass Window small */}
                <mesh position={[-0.8, 2.5, 1.06]} castShadow receiveShadow>
                    <boxGeometry args={[1.5, 0.8, 0.1]} />
                    <MeshDistortMaterial color="#A8C09A" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.9} roughness={0.1} />
                </mesh>

                {/* Wooden accent wall */}
                <mesh position={[1.91, 1, -0.5]} castShadow receiveShadow>
                    <boxGeometry args={[0.1, 2, 2]} />
                    <meshStandardMaterial color="#8A5A44" roughness={0.9} />
                </mesh>

                {/* Pool/Water feature */}
                <mesh position={[1.5, 0.05, 1.2]}>
                    <boxGeometry args={[1.8, 0.1, 1.5]} />
                    <MeshDistortMaterial color="#4A8A8C" speed={2} distort={0.1} radius={1} metalness={0.8} />
                </mesh>

                {/* Trees */}
                <group position={[-1.8, 0.5, 1.5]}>
                    <mesh position={[0, 0.5, 0]} castShadow>
                        <coneGeometry args={[0.3, 1.5, 8]} />
                        <meshStandardMaterial color="#1C2B1A" />
                    </mesh>
                    <mesh position={[0, -0.25, 0]} castShadow>
                        <cylinderGeometry args={[0.08, 0.08, 0.5]} />
                        <meshStandardMaterial color="#5A4033" />
                    </mesh>
                </group>
                <group position={[-2.4, 0.3, 0.8]} scale={0.7}>
                    <mesh position={[0, 0.5, 0]} castShadow>
                        <coneGeometry args={[0.3, 1.5, 8]} />
                        <meshStandardMaterial color="#1C2B1A" />
                    </mesh>
                    <mesh position={[0, -0.25, 0]} castShadow>
                        <cylinderGeometry args={[0.08, 0.08, 0.5]} />
                        <meshStandardMaterial color="#5A4033" />
                    </mesh>
                </group>
                
                {/* Pathway */}
                <mesh position={[-0.5, 0.02, 1.8]} receiveShadow>
                    <boxGeometry args={[1, 0.05, 1.5]} />
                    <meshStandardMaterial color="#B0AFA5" />
                </mesh>
            </Float>
        </group>
    );
}

export default function Hero3DHouse() {
    return (
        <div className="h-[400px] w-full md:h-[600px] lg:h-[700px] cursor-grab active:cursor-grabbing relative z-10">
            <Canvas camera={{ position: [7, 4, 8], fov: 35 }} shadows>
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
                <Environment preset="city" />
                <ModernHouse />
                <ContactShadows position={[0, -0.5, 0]} opacity={0.5} scale={15} blur={2.5} far={4} />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2.1} />
            </Canvas>
        </div>
    );
}
