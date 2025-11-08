import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import type { Mesh } from 'three';

function AgentNode({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const meshRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.3 * scale, 32, 32]} position={position}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </Sphere>
  );
}

function NetworkConnections() {
  const nodes = [
    { pos: [0, 0, 0] as [number, number, number], color: '#00D9FF' },
    { pos: [2, 1, -1] as [number, number, number], color: '#B47EFF' },
    { pos: [-2, -1, 1] as [number, number, number], color: '#10B981' },
    { pos: [1, -2, 0] as [number, number, number], color: '#60A5FA' },
    { pos: [-1, 2, -2] as [number, number, number], color: '#FBBF24' },
  ];

  return (
    <>
      {nodes.map((node, i) => (
        <AgentNode key={i} position={node.pos} color={node.color} scale={i === 0 ? 1.5 : 1} />
      ))}
      
      {/* Connection Lines */}
      {nodes.slice(1).map((node, i) => (
        <Line
          key={i}
          points={[nodes[0].pos, node.pos]}
          color="#00D9FF"
          lineWidth={1}
          opacity={0.3}
        />
      ))}
    </>
  );
}

export function AgentNetworkViz() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#00D9FF] to-[#B47EFF] bg-clip-text text-transparent">
              3D Agent Network
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Interactive visualization of real-time AIZ nodes with quantum particle effects
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,217,255,0.1)]">
          <div className="h-[500px] rounded-2xl overflow-hidden bg-[#0A0E1A]/50">
            <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-400">Loading 3D Visualization...</div>}>
              <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} color="#B47EFF" intensity={0.5} />
                <NetworkConnections />
                <OrbitControls enableZoom={true} enablePan={false} />
              </Canvas>
            </Suspense>
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00D9FF] shadow-[0_0_10px_rgba(0,217,255,0.5)]" />
              <span className="text-gray-400">Primary AIZ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#B47EFF] shadow-[0_0_10px_rgba(180,126,255,0.5)]" />
              <span className="text-gray-400">Sub-AIZ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-gray-400">Active Agents</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}