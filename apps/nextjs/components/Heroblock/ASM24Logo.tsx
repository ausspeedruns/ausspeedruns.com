import { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree, type ThreeElements } from "@react-three/fiber";
import type { Mesh } from "three";
import * as THREE from "three";

// import ASM2024Model from "./ASM2024Textured.glb";
const ASM2024Model = "/ASM2024Textured.glb";

function addEulers(a: THREE.Euler, b: THREE.Euler) {}

export function ASM2024Logo(props: { targetRotation: THREE.Euler } & ThreeElements["group"]) {
	const meshRef = useRef<THREE.Mesh>(null);
	const { viewport } = useThree();
	const { nodes, materials } = useGLTF(ASM2024Model);
	const rotation = new THREE.Quaternion();
	const bobRotation = new THREE.Euler();

	useFrame((state, delta) => {
		const mesh = meshRef.current;
		if (!mesh) return;

		const yPos = Math.sin(state.clock.elapsedTime * 0.5) * 0.05 + 0.05;

		bobRotation.x = Math.sin(state.clock.elapsedTime * 0.5 + 2.5) * 0.1;

		bobRotation.set(
			bobRotation.x + props.targetRotation.x,
			props.targetRotation.y,
			bobRotation.z + props.targetRotation.z,
		);

		rotation.premultiply((new THREE.Quaternion()).setFromEuler(bobRotation))

		mesh.position.set(0, yPos, 0);
		mesh.quaternion.slerp(rotation.setFromEuler(bobRotation), delta * 2);
	});

	const material = materials["ASM Logo"];
	material.vertexColors = true;

	return (
		<group {...props} scale={viewport.width * 0.45} dispose={null}>
			<mesh
				geometry={(nodes.ASM24 as Mesh).geometry}
				material={material}
				ref={meshRef}
			/>
		</group>
	);
}

useGLTF.preload(ASM2024Model);
