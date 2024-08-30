import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MeshDistortMaterial, Environment } from '@react-three/drei';

const ThreeDModel = ({ testResults }) => {
  const meshRef = useRef();
  const rotationSpeed = 0.001;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationSpeed;
      meshRef.current.rotation.y += rotationSpeed;
      meshRef.current.rotation.x += (state.mouse.y * 0.1 - meshRef.current.rotation.x) * 0.1;
      meshRef.current.rotation.y += (state.mouse.x * 0.1 - meshRef.current.rotation.y) * 0.1;
    }
  });

  useEffect(() => {
    if (meshRef.current) {
      const geometry = new THREE.IcosahedronGeometry(1, Math.floor(testResults.perception / 20) + 2);
      
      // Intelligence: 파란색 요소, 뾰족한 형태
      const positions = geometry.attributes.position;
      const sharpness = testResults.intelligence / 100;
      for (let i = 0; i < positions.count; i++) {
        const vertex = new THREE.Vector3();
        vertex.fromBufferAttribute(positions, i);
        vertex.multiplyScalar(1 + Math.random() * sharpness);
        positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }
      geometry.computeVertexNormals();

      // Physical: 빨간색 요소, 불규칙한 돌출
      const physicalFactor = testResults.physical / 100;
      for (let i = 0; i < positions.count; i++) {
        const vertex = new THREE.Vector3();
        vertex.fromBufferAttribute(positions, i);
        const noise = (Math.random() - 0.5) * physicalFactor * 0.2;
        vertex.add(new THREE.Vector3(noise, noise, noise));
        positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }
      geometry.computeVertexNormals();

      // Hidden: 전체적인 투명도 및 광택
      const opacity = 1 - (testResults.hidden / 200);
      const shininess = testResults.hidden / 100;

      // 색상 계산
      const color = new THREE.Color(
        testResults.physical / 100,
        testResults.perception / 100,
        testResults.intelligence / 100
      );

      meshRef.current.geometry = geometry;
      meshRef.current.material.color = color;
      meshRef.current.material.opacity = opacity;
      meshRef.current.material.shininess = shininess * 100;
    }
  }, [testResults]);

  return (
    <>
      <Environment preset="sunset" background />
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 2]} />
        <MeshDistortMaterial
          color={new THREE.Color(
            testResults.physical / 100,
            testResults.perception / 100,
            testResults.intelligence / 100
          )}
          distort={testResults.emotion / 500}
          speed={1.5}
          transparent
          opacity={1 - (testResults.hidden / 200)}
          metalness={testResults.hidden / 100}
          roughness={0.5}
        />
      </mesh>
    </>
  );
};

export default ThreeDModel;