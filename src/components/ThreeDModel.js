import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ThreeDModel = ({ interaction }) => {
  const meshRef = useRef();
  const linesRef = useRef();

  const pointCount = 500;
  const maxConnections = 3;

  const generatePoints = () => {
    const positions = [];
    const sizes = [];
    const lifetimes = [];
    const colors = [];

    for (let i = 0; i < pointCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 1 + (Math.random() - 0.5) * 0.1;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions.push(x, y, z);
      sizes.push(Math.random());
      lifetimes.push(Math.random() * 5);

      // 청록색부터 보라색까지의 그라데이션 색상 생성
      const t = Math.random();
      const r_color = 0.5 * t;
      const g_color = 0.8 * (1 - t);
      const b_color = 1.0;
      colors.push(r_color, g_color, b_color);
    }

    return { positions, sizes, lifetimes, colors };
  };

  const [positions, sizes, lifetimes, colors] = useMemo(() => {
    const { positions, sizes, lifetimes, colors } = generatePoints();
    return [
      new Float32Array(positions),
      new Float32Array(sizes),
      new Float32Array(lifetimes),
      new Float32Array(colors)
    ];
  }, []);

  const updatePoints = () => {
    const positionAttr = meshRef.current.geometry.attributes.position;
    const sizeAttr = meshRef.current.geometry.attributes.size;
    const lifetimeAttr = meshRef.current.geometry.attributes.lifetime;
    const colorAttr = meshRef.current.geometry.attributes.color;

    for (let i = 0; i < pointCount; i++) {
      lifetimeAttr.array[i] -= 0.016;

      if (lifetimeAttr.array[i] <= 0) {
        // 점 재생성
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const r = 1 + (Math.random() - 0.5) * 0.1;

        positionAttr.array[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positionAttr.array[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positionAttr.array[i * 3 + 2] = r * Math.cos(phi);

        sizeAttr.array[i] = Math.random();
        lifetimeAttr.array[i] = Math.random() * 5;

        // 새로운 색상 생성
        const t = Math.random();
        colorAttr.array[i * 3] = 0.5 * t;
        colorAttr.array[i * 3 + 1] = 0.8 * (1 - t);
        colorAttr.array[i * 3 + 2] = 1.0;
      }
    }

    positionAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
    lifetimeAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;

    // 선 업데이트
    const linePositions = [];
    const lineIndices = [];

    for (let i = 0; i < pointCount; i++) {
      const connections = [];
      for (let j = 0; j < pointCount; j++) {
        if (i !== j) {
          const dx = positionAttr.array[i * 3] - positionAttr.array[j * 3];
          const dy = positionAttr.array[i * 3 + 1] - positionAttr.array[j * 3 + 1];
          const dz = positionAttr.array[i * 3 + 2] - positionAttr.array[j * 3 + 2];
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < 0.3) {
            connections.push(j);
            if (connections.length >= maxConnections) break;
          }
        }
      }

      for (const j of connections) {
        linePositions.push(
          positionAttr.array[i * 3], positionAttr.array[i * 3 + 1], positionAttr.array[i * 3 + 2],
          positionAttr.array[j * 3], positionAttr.array[j * 3 + 1], positionAttr.array[j * 3 + 2]
        );
        lineIndices.push(linePositions.length / 3 - 2, linePositions.length / 3 - 1);
      }
    }

    linesRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    linesRef.current.geometry.setIndex(lineIndices);
  };

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geo.setAttribute('lifetime', new THREE.Float32BufferAttribute(lifetimes, 1));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geo;
  }, [positions, sizes, lifetimes, colors]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        interaction: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute float lifetime;
        attribute vec3 color;
        varying vec3 vColor;
        varying vec3 vPosition;
        varying float vLifetime;
        uniform float time;
        uniform float interaction;
        
        void main() {
          vPosition = position;
          vLifetime = lifetime;
          vColor = color;
          vec3 pos = position;
          float noise = sin(pos.x * 2.0 + time) * cos(pos.y * 2.0 + time) * sin(pos.z * 2.0 + time) * 0.05;
          pos += normalize(pos) * noise * (1.0 + interaction);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * 1.5;
        }
      `,
      fragmentShader: `
        varying vec3 vPosition;
        varying float vLifetime;
        varying vec3 vColor;
        
        void main() {
          float opacity = smoothstep(-1.0, 1.0, vPosition.z) * (vLifetime / 5.0);
          gl_FragColor = vec4(vColor, opacity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  const lineMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: 0x4080ff,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame((state) => {
    if (meshRef.current && linesRef.current) {
      meshRef.current.rotation.y += 0.0002;
      linesRef.current.rotation.y += 0.0002;

      meshRef.current.material.uniforms.time.value = state.clock.getElapsedTime();
      meshRef.current.material.uniforms.interaction.value = THREE.MathUtils.lerp(
        meshRef.current.material.uniforms.interaction.value,
        interaction ? 0.5 : 0,
        0.05
      );
      updatePoints();
    }
  });

  return (
    <>
      <points ref={meshRef} geometry={geometry} material={material} />
      <lineSegments ref={linesRef}>
        <bufferGeometry />
        <lineBasicMaterial attach="material" {...lineMaterial} />
      </lineSegments>
    </>
  );
};

export default ThreeDModel;