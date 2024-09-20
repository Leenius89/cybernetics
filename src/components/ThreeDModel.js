import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MeshDistortMaterial, Environment, Text } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';

const ThreeDModel = ({ testResults, selectedCount }) => {
  const meshRef = useRef();
  const [isRippling, setIsRippling] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [rippleProgress, setRippleProgress] = useState(0);

  const { distort } = useSpring({
    distort: isRippling ? 1 : 0,
    config: { duration: 1000 }
  });

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime()) * 0.1;
      meshRef.current.rotation.y = Math.cos(state.clock.getElapsedTime()) * 0.1;
    }
  });

  useEffect(() => {
    if (selectedCount === 5) {
      const messages = ["Great!", "Keep going!", "Good job!"];
      setEncouragementMessage(messages[Math.floor(Math.random() * messages.length)]);
      setTimeout(() => setEncouragementMessage(''), 3000);
    }
  }, [selectedCount]);

  const handleClick = () => {
    setIsRippling(true);
    // 여기에 띵 소리 재생 로직 추가
    // 예: new Audio('path/to/ding-sound.mp3').play();
    setTimeout(() => setIsRippling(false), 1000);
  };

  useFrame((state, delta) => {
    if (meshRef.current) {
      if (isRippling) {
        setRippleProgress((prev) => Math.min(prev + delta * 2, 1));
      } else {
        setRippleProgress(0);
      }

      meshRef.current.material.distort = isRippling ? 1 - rippleProgress : testResults.emotion / 500;
    }
  });

  return (
    <>
      <color attach="background" args={['white']} />
      <Environment preset="sunset" />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <animated.mesh ref={meshRef} onClick={handleClick}>
        <sphereGeometry args={[1, 64, 64]} />
        <animated.meshDistortMaterial
          color={new THREE.Color(
            testResults.physical / 100,
            testResults.perception / 100,
            testResults.intelligence / 100
          )}
          distort={distort}
          speed={3}
          transparent
          opacity={1 - (testResults.hidden / 200)}
          metalness={testResults.hidden / 100}
          roughness={0.5}
        />
      </animated.mesh>
      {encouragementMessage && (
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.5}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {encouragementMessage}
        </Text>
      )}
    </>
  );
};

export default ThreeDModel;