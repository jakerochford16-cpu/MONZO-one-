"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Mesh } from "three";
import type { ProductShape } from "@/lib/products";

function Geometry({ shape }: { shape: ProductShape }) {
  switch (shape) {
    case "box":
      return <boxGeometry args={[1.4, 1.4, 1.4]} />;
    case "torus":
      return <torusGeometry args={[1, 0.4, 32, 64]} />;
    case "icosahedron":
      return <icosahedronGeometry args={[1.2, 0]} />;
    case "cone":
      return <coneGeometry args={[1, 1.6, 32]} />;
    case "torusKnot":
      return <torusKnotGeometry args={[0.8, 0.25, 128, 16]} />;
  }
}

function SpinningModel({ shape, color }: { shape: ProductShape; color: string }) {
  const mesh = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (mesh.current) mesh.current.rotation.y += delta * 0.5;
  });
  return (
    <mesh ref={mesh} castShadow>
      <Geometry shape={shape} />
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
    </mesh>
  );
}

interface ProductViewer3DProps {
  shape: ProductShape;
  color: string;
  interactive?: boolean;
  className?: string;
}

// Stand-in preview using a primitive geometry per shape. Once real product
// scans exist, swap SpinningModel for a useGLTF("/models/<slug>.glb") mesh.
export function ProductViewer3D({
  shape,
  color,
  interactive = false,
  className,
}: ProductViewer3DProps) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [2.5, 1.8, 2.5], fov: 40 }} shadows>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 2]} intensity={1.4} castShadow />
        <directionalLight position={[-3, 2, -2]} intensity={0.4} />
        <SpinningModel shape={shape} color={color} />
        {interactive && (
          <OrbitControls enablePan={false} minDistance={2} maxDistance={5} />
        )}
      </Canvas>
    </div>
  );
}
