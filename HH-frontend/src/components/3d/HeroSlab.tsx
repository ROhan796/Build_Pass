import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

function GlassSlabMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.35;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.12;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.25} floatIntensity={0.9}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[3.0, 4.2, 0.22]} />
        <meshPhysicalMaterial
          roughness={0.05}
          transmission={0.92}
          thickness={0.8}
          ior={1.5}
          reflectivity={0.9}
          color="#c5a059"
          emissive="#8e723d"
          emissiveIntensity={0.2}
          metalness={0.2}
          transparent={true}
          opacity={0.85}
        />
      </mesh>
    </Float>
  );
}

// Fallback CSS 3D Glass Slab for devices where WebGL fails or is disabled
function CSSGlassSlabFallback() {
  return (
    <div className="relative w-[280px] h-[360px] md:w-[320px] md:h-[420px] rounded-3xl p-6 glass-gold glow-gold-lg flex flex-col justify-between items-center text-center transition-all duration-700">
      <div className="w-12 h-12 rounded-full bg-[#c5a059]/20 border border-[#c5a059] flex items-center justify-center text-xl">
        🏄‍♂️
      </div>
      <div>
        <span className="text-xs font-mono text-[#c5a059] tracking-widest uppercase block mb-1">
          HH GOA 2026
        </span>
        <h3 className="text-2xl font-semibold font-serif text-white">
          BUILDER PASS
        </h3>
      </div>
      <div className="w-full h-32 rounded-xl bg-[#121212] border border-white/10 flex items-center justify-center text-[#d4d4d4] text-sm font-sans">
        SOPHISTICATED OBSIDIAN SLAB
      </div>
    </div>
  );
}

export default function HeroSlab() {
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return <CSSGlassSlabFallback />;
  }

  return (
    <div className="relative w-full h-[360px] md:h-[460px] flex items-center justify-center">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={2.0} color="#c5a059" />
        <pointLight position={[-4, 4, 3]} intensity={2.5} color="#e6ca85" />
        <pointLight position={[3, -3, 2]} intensity={1.5} color="#8e723d" />
        <Environment preset="night" />
        <GlassSlabMesh />
      </Canvas>
      {/* Overlay HH Logo Badge in Center */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center">
        <div className="px-5 py-2.5 rounded-full bg-[#0a0a0a]/80 backdrop-blur-md border border-[#c5a059]/40 shadow-[0_0_30px_rgba(197,160,89,0.3)] flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059] animate-ping" />
          <span className="font-mono text-xs font-semibold text-[#c5a059] tracking-widest">
            HH GOA 2026
          </span>
        </div>
      </div>
    </div>
  );
}
