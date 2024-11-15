import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface ModelViewerProps {
  modelData: string;
  thumbnailUrl: string;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ modelData, thumbnailUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const isUserInteracting = useRef(false);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    if (!containerRef.current || !modelData) return;

    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f4);

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Setup controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Add interaction listeners with timeout
    controls.addEventListener('start', () => {
      isUserInteracting.current = true;
    });
    
    controls.addEventListener('end', () => {
      // Add small delay before allowing rotation to resume
      setTimeout(() => {
        isUserInteracting.current = false;
      }, 150);
    });

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add multiple directional lights for better coverage
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight1.position.set(1, 1, 1);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight2.position.set(-1, -1, -1);
    scene.add(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight3.position.set(0, 1, 0);
    scene.add(directionalLight3);

    // Load model
    const loader = new GLTFLoader();
    
    // Convert base64 string to binary data
    const binaryString = atob(modelData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    const modelBlob = new Blob([bytes], { type: 'model/gltf-binary' });
    const modelUrl = URL.createObjectURL(modelBlob);

    loader.load(modelUrl, (gltf) => {
      modelRef.current = gltf.scene;
      scene.add(gltf.scene);
      
      // Center and scale model
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 3 / maxDim;
      gltf.scene.scale.multiplyScalar(scale);
      gltf.scene.position.sub(center.multiplyScalar(scale));

      // Start animation after model is loaded
      animate();
    });

    // Animation loop
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      controls.update();

      if (modelRef.current && !isUserInteracting.current) {
        modelRef.current.rotation.y += 0.005; // Increased rotation speed
      }

      renderer.render(scene, camera);
    };

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('resize', handleResize);
      URL.revokeObjectURL(modelUrl);
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [modelData]);

  return (
    <div className="relative">
      <div ref={containerRef} className="w-full h-[400px] rounded-lg overflow-hidden" />
      <img 
        src={thumbnailUrl} 
        alt="Model thumbnail" 
        className="absolute bottom-4 right-4 w-24 h-24 object-cover rounded-lg border-2 border-white shadow-lg"
      />
    </div>
  );
};

export default ModelViewer;
