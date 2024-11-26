import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

interface ModelViewerProps {
  modelData: string;
  thumbnailUrl: string;
  hdrFile?: File;
  onHdrFileChange?: (file: File) => void;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ modelData, thumbnailUrl, hdrFile, onHdrFileChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const isUserInteracting = useRef(false);
  const animationFrameId = useRef<number>();
  const envMapRef = useRef<THREE.Texture | null>(null);

  const handleDownloadModel = () => {
    const binaryString = atob(modelData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: 'model/gltf-binary' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '3d-model.glb';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadImage = () => {
    const a = document.createElement('a');
    a.href = thumbnailUrl;
    a.download = 'thumbnail.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    if (!containerRef.current || !modelData) return;

    // Declare variables for cleanup
    let hdrObjectUrl: string | null = null;
    let pmremGenerator: THREE.PMREMGenerator | null = null;

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

    // Interaction listeners
    controls.addEventListener('start', () => {
      isUserInteracting.current = true;
    });

    controls.addEventListener('end', () => {
      setTimeout(() => {
        isUserInteracting.current = false;
      }, 150);
    });

    // Lighting setup
    if (hdrFile) {
      pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();

      const loader = new RGBELoader();
      hdrObjectUrl = URL.createObjectURL(hdrFile);

      loader.load(
        hdrObjectUrl,
        (texture) => {
          const envMap = pmremGenerator!.fromEquirectangular(texture).texture;
          scene.environment = envMap;
          scene.background = envMap;

          envMapRef.current = envMap;

          // Dispose of texture
          texture.dispose();
        },
        undefined,
        (error) => {
          console.error('An error occurred loading the HDR texture:', error);
        }
      );
    } else {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight1.position.set(1, 1, 1);
      scene.add(directionalLight1);

      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight2.position.set(-1, -1, -1);
      scene.add(directionalLight2);

      const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight3.position.set(0, 1, 0);
      scene.add(directionalLight3);
    }

    // Load model
    const gltfLoader = new GLTFLoader();

    const binaryString = atob(modelData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const modelBlob = new Blob([bytes], { type: 'model/gltf-binary' });
    const modelUrl = URL.createObjectURL(modelBlob);

    gltfLoader.load(
      modelUrl,
      (gltf) => {
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

        // Rotate model to face front
        gltf.scene.rotation.y = Math.PI;

        // Start animation loop
        animate();
      },
      undefined,
      (error) => {
        console.error('An error occurred loading the model:', error);
      }
    );

    // Animation loop
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      controls.update();

      if (modelRef.current && !isUserInteracting.current) {
        modelRef.current.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('resize', handleResize);
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      if (envMapRef.current) {
        envMapRef.current.dispose();
      }
      if (pmremGenerator) {
        pmremGenerator.dispose();
      }
      if (hdrObjectUrl) {
        URL.revokeObjectURL(hdrObjectUrl);
      }
      URL.revokeObjectURL(modelUrl);
    };
  }, [modelData, hdrFile]);

  return (
    <div className="relative">
      <div ref={containerRef} className="w-full h-[400px] rounded-lg overflow-hidden" />
      <div className="absolute bottom-4 right-4 flex items-end gap-4">
        <div className="flex gap-2">
          <button
            onClick={handleDownloadModel}
            title="Download 3D Model"
            className="p-2 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 rounded-lg transition-colors duration-300 shadow-sm border border-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
          <button
            onClick={handleDownloadImage}
            title="Download Image"
            className="p-2 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 rounded-lg transition-colors duration-300 shadow-sm border border-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </button>
          <label
            title="Upload HDR Environment"
            className="p-2 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 rounded-lg transition-colors duration-300 shadow-sm border border-gray-200 cursor-pointer"
          >
            <input
              type="file"
              accept=".hdr"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onHdrFileChange?.(file);
                }
              }}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3v18" />
              <path d="M3 12h18" />
            </svg>
          </label>
        </div>
        <img
          src={thumbnailUrl}
          alt="Model thumbnail"
          className="w-24 h-24 object-cover rounded-lg border-2 border-white shadow-lg"
        />
      </div>
    </div>
  );
};

export default ModelViewer;
