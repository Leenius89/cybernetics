import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ThreeDModel = ({ interaction }) => {
  const meshRef = useRef();
  const linesRef = useRef();
  const facesRef = useRef();
  const interactionRef = useRef(0);
  const pulseRef = useRef(0);

  const pointCount = 500;
  const maxConnections = 2;

  const generatePoints = () => {
    const positions = [];
    const sizes = [];
    const lifetimes = [];

    for (let i = 0; i < pointCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 1 + (Math.random() - 0.5) * 0.1;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions.push(x, y, z);
      sizes.push(Math.random() * 0.03 + 0.01);
      lifetimes.push(Math.random() * 5);
    }

    return { positions, sizes, lifetimes };
  };

  const [positions, sizes, lifetimes] = useMemo(() => {
    const { positions, sizes, lifetimes } = generatePoints();
    return [
      new Float32Array(positions),
      new Float32Array(sizes),
      new Float32Array(lifetimes)
    ];
  }, []);

  const updatePoints = (state) => {
    const positionAttr = meshRef.current.geometry.attributes.position;
    const sizeAttr = meshRef.current.geometry.attributes.size;
    const lifetimeAttr = meshRef.current.geometry.attributes.lifetime;

    const time = state.clock.getElapsedTime();
    const interactionStrength = interactionRef.current;
    const pulseStrength = pulseRef.current;

    for (let i = 0; i < pointCount; i++) {
      lifetimeAttr.array[i] -= 0.016;

      if (lifetimeAttr.array[i] <= 0) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const r = 1 + (Math.random() - 0.5) * 0.1;

        positionAttr.array[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positionAttr.array[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positionAttr.array[i * 3 + 2] = r * Math.cos(phi);

        sizeAttr.array[i] = Math.random() * 0.03 + 0.01;
        lifetimeAttr.array[i] = Math.random() * 5;
      }

      const index = i * 3;
      const noise = Math.sin(positionAttr.array[index] * 2 + time) *
                    Math.cos(positionAttr.array[index + 1] * 2 + time) *
                    Math.sin(positionAttr.array[index + 2] * 2 + time) * 0.05;
      
      const direction = new THREE.Vector3(
        positionAttr.array[index],
        positionAttr.array[index + 1],
        positionAttr.array[index + 2]
      ).normalize();

      const pulse = Math.sin(time * 10) * pulseStrength * 0.05;

      positionAttr.array[index] += direction.x * (noise + pulse) * interactionStrength;
      positionAttr.array[index + 1] += direction.y * (noise + pulse) * interactionStrength;
      positionAttr.array[index + 2] += direction.z * (noise + pulse) * interactionStrength;

      // 점 크기 변화
      sizeAttr.array[i] *= 1 + pulse * 0.2;
    }

    positionAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
    lifetimeAttr.needsUpdate = true;

    const linePositions = [];
    const lineIndices = [];
    const facePositions = [];
    const faceIndices = [];

    for (let i = 0; i < pointCount; i++) {
      const connections = [];
      for (let j = i + 1; j < pointCount; j++) {
        const dx = positionAttr.array[i * 3] - positionAttr.array[j * 3];
        const dy = positionAttr.array[i * 3 + 1] - positionAttr.array[j * 3 + 1];
        const dz = positionAttr.array[i * 3 + 2] - positionAttr.array[j * 3 + 2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < 0.5) {
          connections.push(j);
          if (connections.length >= maxConnections) break;
        }
      }

      for (const j of connections) {
        linePositions.push(
          positionAttr.array[i * 3], positionAttr.array[i * 3 + 1], positionAttr.array[i * 3 + 2],
          positionAttr.array[j * 3], positionAttr.array[j * 3 + 1], positionAttr.array[j * 3 + 2]
        );
        lineIndices.push(linePositions.length / 3 - 2, linePositions.length / 3 - 1);

        if (connections.length > 1) {
          const k = connections[1];
          facePositions.push(
            positionAttr.array[i * 3], positionAttr.array[i * 3 + 1], positionAttr.array[i * 3 + 2],
            positionAttr.array[j * 3], positionAttr.array[j * 3 + 1], positionAttr.array[j * 3 + 2],
            positionAttr.array[k * 3], positionAttr.array[k * 3 + 1], positionAttr.array[k * 3 + 2]
          );
          faceIndices.push(facePositions.length / 3 - 3, facePositions.length / 3 - 2, facePositions.length / 3 - 1);
        }
      }
    }

    linesRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    linesRef.current.geometry.setIndex(lineIndices);

    facesRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(facePositions, 3));
    facesRef.current.geometry.setIndex(faceIndices);
  };

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geo.setAttribute('lifetime', new THREE.Float32BufferAttribute(lifetimes, 1));
    return geo;
  }, [positions, sizes, lifetimes]);

  const pointMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        interaction: { value: 0 },
        colorPhase: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute float lifetime;
        varying vec3 vColor;
        varying vec3 vPosition;
        varying float vLifetime;
        uniform float time;
        uniform float interaction;
        uniform float colorPhase;
        
        vec3 getColor(float t) {
          vec3 colors[5] = vec3[5](
            vec3(0.0, 0.0, 0.5),  // Deep Blue
            vec3(0.0, 1.0, 1.0),  // Cyan
            vec3(0.0, 1.0, 0.0),  // Green
            vec3(1.0, 1.0, 0.0),  // Yellow
            vec3(1.0, 0.0, 0.0)   // Red
          );
          
          float index = t * 4.0;
          int i = int(floor(index));
          float f = fract(index);
          
          if (i >= 4) return colors[4];
          return mix(colors[i], colors[i + 1], f);
        }

        void main() {
          vPosition = position;
          vLifetime = lifetime;
          float t = fract(colorPhase + length(position) * 0.5);
          vColor = getColor(t);
          vec3 pos = position;
          float noise = sin(pos.x * 2.0 + time) * cos(pos.y * 2.0 + time) * sin(pos.z * 2.0 + time) * 0.05;
          pos += normalize(pos) * noise * (1.0 + interaction);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / length(mvPosition.xyz));
        }
      `,
      fragmentShader: `
        varying vec3 vPosition;
        varying float vLifetime;
        varying vec3 vColor;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float opacity = smoothstep(0.5, 0.0, dist) * (vLifetime / 5.0);
          gl_FragColor = vec4(vColor, opacity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  const lineMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  const faceMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        colorPhase: { value: 0 },
      },
      vertexShader: `
        varying vec3 vPosition;
        uniform float time;
        uniform float colorPhase;
        
        void main() {
          vPosition = position;
          vec3 pos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPosition;
        uniform float colorPhase;
        
        vec3 getColor(float t) {
          vec3 colors[5] = vec3[5](
            vec3(0.0, 0.0, 0.5),  // Deep Blue
            vec3(0.0, 1.0, 1.0),  // Cyan
            vec3(0.0, 1.0, 0.0),  // Green
            vec3(1.0, 1.0, 0.0),  // Yellow
            vec3(1.0, 0.0, 0.0)   // Red
          );
          
          float index = t * 4.0;
          int i = int(floor(index));
          float f = fract(index);
          
          if (i >= 4) return colors[4];
          return mix(colors[i], colors[i + 1], f);
        }
        
        void main() {
          float t = fract(colorPhase + length(vPosition) * 0.5);
          vec3 color = getColor(t);
          gl_FragColor = vec4(color, 0.1);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }, []);

  useFrame((state) => {
    if (meshRef.current && linesRef.current && facesRef.current) {
      meshRef.current.rotation.y += 0.0002;
      linesRef.current.rotation.y += 0.0002;
      facesRef.current.rotation.y += 0.0002;

      const time = state.clock.getElapsedTime();
      meshRef.current.material.uniforms.time.value = time;
      meshRef.current.material.uniforms.colorPhase.value = (Math.sin(time * 0.05) + 1) * 0.5;
      facesRef.current.material.uniforms.time.value = time;
      facesRef.current.material.uniforms.colorPhase.value = (Math.sin(time * 0.05) + 1) * 0.5;
      
      interactionRef.current = THREE.MathUtils.lerp(
        interactionRef.current,
        interaction ? 1 : 0,
        0.1
      );
      pulseRef.current = THREE.MathUtils.lerp(
        pulseRef.current,
        interaction ? 1 : 0,
        0.2
      );
      meshRef.current.material.uniforms.interaction.value = interactionRef.current;

      updatePoints(state);
    }
  });

  return (
    <>
      <points ref={meshRef} geometry={geometry} material={pointMaterial} />
      <lineSegments ref={linesRef}>
        <bufferGeometry />
        <lineBasicMaterial attach="material" {...lineMaterial} />
      </lineSegments>
      <mesh ref={facesRef}>
        <bufferGeometry />
        <shaderMaterial attach="material" args={[faceMaterial]} />
      </mesh>
    </>
  );
};

export default ThreeDModel;