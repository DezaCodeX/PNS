"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function ArchitecturalScene() {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((state, delta) => {
    const current = group.current;
    if (!current) return;
    const scrollDepth = (window.scrollY / Math.max(window.innerHeight, 1)) * 0.06;
    const ease = 1 - Math.exp(-2 * Math.min(delta, 0.05));
    current.rotation.y += (pointer.x * 0.08 + scrollDepth - current.rotation.y) * ease;
    current.rotation.x += (-pointer.y * 0.025 - current.rotation.x) * ease;
    current.position.z +=
      (Math.sin(state.clock.elapsedTime * 0.16) * 0.08 - current.position.z) * ease;
  });

  return (
    <group ref={group} position={[0, -1.6, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#b9cbd5" roughness={0.35} metalness={0.12} />
      </mesh>
      {[-4.3, 4.3].map((x) => (
        <group key={x} position={[x, 2, -2]}>
          <mesh>
            <boxGeometry args={[0.48, 7, 0.48]} />
            <meshStandardMaterial color="#f3f8fa" roughness={0.28} metalness={0.18} />
          </mesh>
          <mesh position={[0, 0.5, 0.25]}>
            <boxGeometry args={[1.2, 2.3, 0.07]} />
            <meshStandardMaterial color="#cf8c55" emissive="#6a4024" emissiveIntensity={0.22} />
          </mesh>
        </group>
      ))}
      {[2.5, 4.4, 6.2].map((z, index) => (
        <mesh key={z} position={[0, 3.9 - index * 0.25, -z]} rotation={[0.08, 0, 0]}>
          <boxGeometry args={[9.5 - index * 0.7, 0.22, 0.48]} />
          <meshStandardMaterial
            color={index === 0 ? "#cf8c55" : "#f3f8fa"}
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
      ))}
      <mesh position={[0, 4.9, -3.3]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#f6e2b4" emissive="#cf8c55" emissiveIntensity={1.2} />
      </mesh>
      <pointLight position={[0, 4.7, -3]} color="#cf8c55" intensity={12} distance={9} />
    </group>
  );
}

export default function AboutScene() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    // Let the App Router client boundary mount before R3F measures the canvas.
    const resizeTimer = window.setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 500);
    return () => {
      window.clearTimeout(resizeTimer);
      media.removeEventListener("change", update);
    };
  }, []);

  return (
    <Canvas
      dpr={reduced ? 1 : [1, 1.5]}
      camera={{ position: [0, 1.1, 9], fov: 48 }}
      gl={{ antialias: !reduced, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
      fallback={<div className="absolute inset-0 bg-[var(--hero-overlay)]" />}
    >
      <ambientLight intensity={1.2} color="#f3f8fa" />
      <directionalLight position={[3, 6, 4]} intensity={2.4} color="#f6e2b4" />
      <ArchitecturalScene />
    </Canvas>
  );
}
