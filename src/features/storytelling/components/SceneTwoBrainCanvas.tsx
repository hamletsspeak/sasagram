"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Box3, MathUtils, Vector3, type Group } from "three";
import styles from "./CinematicStorytelling.module.css";

type HotspotLight = {
  id: string;
  position: [number, number, number];
};

function getMinimalConnectorRotationY(position: [number, number, number]): number {
  const [x, , z] = position;
  return Math.atan2(z, x) - 0.08;
}

function BrainHologramModel({
  hotspots,
  selectedHotspotId,
  visibleHotspotsCount,
}: {
  hotspots: HotspotLight[];
  selectedHotspotId: string | null;
  visibleHotspotsCount: number;
}) {
  const gltf = useGLTF("/assets/3d/brain_hologram.glb");
  const groupRef = useRef<Group | null>(null);
  const autoRotationRef = useRef(0);
  const modelCenterOffset = useMemo(() => {
    const box = new Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new Vector3());
    return new Vector3(-center.x, -center.y, -center.z);
  }, [gltf.scene]);
  const selectedHotspot = hotspots.find((hotspot) => hotspot.id === selectedHotspotId);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    autoRotationRef.current += delta * (selectedHotspot ? 0.12 : 0.22);
    const targetRotationY = selectedHotspot
      ? getMinimalConnectorRotationY(selectedHotspot.position) + autoRotationRef.current * 0.45
      : -0.3 + autoRotationRef.current;
    const targetPositionX = selectedHotspot ? 0.24 : 0.32;
    const targetPositionY = selectedHotspot ? -0.26 : -0.22;
    const targetPositionZ = selectedHotspot ? -0.24 : -0.18;
    group.rotation.y = MathUtils.damp(group.rotation.y, targetRotationY, 3.6, delta);
    group.position.x = MathUtils.damp(group.position.x, targetPositionX, 3.2, delta);
    group.position.y = MathUtils.damp(group.position.y, targetPositionY, 3.2, delta);
    group.position.z = MathUtils.damp(group.position.z, targetPositionZ, 3.2, delta);
    group.rotation.x = MathUtils.damp(group.rotation.x, -0.08, 2.4, delta);
    group.rotation.z = MathUtils.damp(group.rotation.z, 0.04, 2.2, delta);
  });

  return (
    <group ref={groupRef} position={[0.32, -0.22, -0.18]} rotation={[0, -0.3, 0]} scale={0.68}>
      <group position={[modelCenterOffset.x, modelCenterOffset.y, modelCenterOffset.z]}>
        <primitive object={gltf.scene} />
        {hotspots.map((hotspot, index) =>
          index < visibleHotspotsCount ? (
            <group key={hotspot.id} position={hotspot.position}>
              <mesh>
                <sphereGeometry args={[0.02, 24, 24]} />
                <meshStandardMaterial
                  color={selectedHotspotId === hotspot.id ? "#5f0d14" : "#8ed5ff"}
                  emissive={selectedHotspotId === hotspot.id ? "#2a0308" : "#5ec4ff"}
                  emissiveIntensity={selectedHotspotId === hotspot.id ? 1.35 : 1.25}
                />
              </mesh>
            </group>
          ) : null,
        )}
      </group>
    </group>
  );
}

type SceneTwoBrainCanvasProps = {
  hotspots: HotspotLight[];
  selectedHotspotId: string | null;
  visibleHotspotsCount: number;
  orbitTarget: [number, number, number];
  isActive: boolean;
};

export default function SceneTwoBrainCanvas({
  hotspots,
  selectedHotspotId,
  visibleHotspotsCount,
  orbitTarget,
  isActive,
}: SceneTwoBrainCanvasProps) {
  return (
    <Canvas
      className={styles.sceneModelCanvas}
      dpr={[1, 1.35]}
      frameloop={isActive ? "always" : "never"}
      camera={{ position: [0, 0.2, 3.3], fov: 34 }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[2.5, 3, 2]} intensity={1.4} />
      <directionalLight position={[-2.5, -1.5, -2]} intensity={0.4} />
      <Suspense fallback={null}>
        <BrainHologramModel
          hotspots={hotspots}
          selectedHotspotId={selectedHotspotId}
          visibleHotspotsCount={visibleHotspotsCount}
        />
        <OrbitControls
          makeDefault
          target={orbitTarget}
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.7}
          minDistance={2.2}
          maxDistance={6}
        />
      </Suspense>
    </Canvas>
  );
}
