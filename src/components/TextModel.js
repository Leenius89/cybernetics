import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

const TextModel = ({ text }) => {
  const meshRef = useRef();

  const { positions, indices } = useMemo(() => {
    const loader = new FontLoader();
    const font = loader.parse(require('three/examples/fonts/helvetiker_bold.typeface.json'));
    
    const geometry = new TextGeometry(text, {
      font: font,
      size: 0.5,
      height: 0.1,
    });

    geometry.center();

    const positions = geometry.attributes.position.array;
    const indices = geometry.index ? geometry.index.array : [];

    return { positions, indices };
  }, [text]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    if (indices.length > 0) {
      geo.setIndex(indices);
    }
    return geo;
  }, [positions, indices]);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.02,
    });
  }, []);

  const lineMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.5,
    });
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={meshRef}>
      <points geometry={geometry} material={material} />
      <lineSegments geometry={geometry} material={lineMaterial} />
    </group>
  );
};

export default TextModel;