import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, Html } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

// Rotating wrapper around the car model that handles smooth cursor-guided horizontal rotation
const RotatingModelWrapper = ({ 
    url, 
    cursorRotationRef, 
    onLoaded 
}) => {
    const groupRef = useRef();

    useFrame((_, delta) => {
        if (!groupRef.current) return;
        // Damp smoothly towards target cursor rotation offset (frame-rate independent damping)
        const target = cursorRotationRef.current.target;
        const current = groupRef.current.rotation.y;
        
        // Fast yet smooth interpolation
        const step = 1 - Math.exp(-12 * delta);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(current, target, step);
    });

    return (
        <group ref={groupRef}>
            <Center top>
                <CarModel url={url} onLoaded={onLoaded} />
            </Center>
        </group>
    );
};

// Subcomponent to load and render GLTF/GLB models with automatic scale normalization
const CarModel = ({ url, onLoaded }) => {
    const { scene } = useGLTF(url);
    const modelRef = useRef();

    useEffect(() => {
        if (scene) {
            // Traverse model to enable shadows, correct materials
            scene.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.material) {
                        child.material.side = THREE.DoubleSide;
                        child.material.needsUpdate = true;
                    }
                }
            });

            // Automatically calculate bounding box and rescale so the car fills the view nicely
            const box = new THREE.Box3().setFromObject(scene);
            const size = new THREE.Vector3();
            box.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);

            if (maxDim > 0 && modelRef.current) {
                // Target standard showroom size (around 3.8 units)
                const targetDim = 3.8;
                const scaleFactor = targetDim / maxDim;
                modelRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
            }

            if (onLoaded) onLoaded();
        }
    }, [scene, onLoaded]);

    return (
        <group ref={modelRef}>
            <primitive 
                object={scene} 
                dispose={null} 
            />
        </group>
    );
};

// Canvas Loader Component
const CanvasLoadingIndicator = () => (
    <Html center>
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            color: '#f8fafc',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            gap: '10px',
            minWidth: '180px'
        }}>
            <Loader2 className="animate-spin" size={28} style={{ color: '#38bdf8' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                Loading 3D Model...
            </span>
        </div>
    </Html>
);

// Fallback Error Boundary within React
class ModelErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error rendering 3D car model:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '380px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0f172a',
                    color: '#e2e8f0',
                    padding: '24px',
                    textAlign: 'center',
                    borderRadius: '10px'
                }}>
                    <AlertCircle size={40} color="#f87171" style={{ marginBottom: '12px' }} />
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#f1f5f9' }}>
                        Unable to Display 3D Model
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', maxWidth: '380px' }}>
                        The 3D model could not be loaded or is corrupted. Showing standard view.
                    </p>
                    {this.props.onFallback && (
                        <button
                            type="button"
                            onClick={this.props.onFallback}
                            style={{
                                marginTop: '16px',
                                padding: '8px 16px',
                                backgroundColor: '#0284c7',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Switch to Photo Gallery
                        </button>
                    )}
                </div>
            );
        }
        return this.props.children;
    }
}

/**
 * Interactive 360° Rotating Car Viewer Component
 * Supports GLTF & GLB models:
 * - Hover cursor tracking: moving mouse left/right rotates car smoothly with inertia/damping
 * - Mouse leave stops cursor rotation and smoothly retains the current angle
 * - Desktop click-and-drag and mobile/touch finger drag for full 360° rotation
 * - Zoom in/out, auto-rotation toggle, reset view, and studio lighting
 */
const CarViewer360 = ({ modelUrl, carName, onSwitchToGallery }) => {
    const controlsRef = useRef();
    const containerRef = useRef();
    const [autoRotate, setAutoRotate] = useState(false);
    const [modelError, setModelError] = useState(false);

    // Refs for cursor hover rotation
    const cursorRotationRef = useRef({ target: 0 });
    const isDraggingRef = useRef(false);
    const lastMouseXRef = useRef(null);

    // Resolve full URL if backend local path
    const resolvedUrl = modelUrl.startsWith('http') || modelUrl.startsWith('blob:') || modelUrl.startsWith('data:')
        ? modelUrl
        : `http://localhost:5000${modelUrl}`;

    const handleResetView = () => {
        if (controlsRef.current) {
            controlsRef.current.reset();
        }
        cursorRotationRef.current.target = 0;
    };

    const handleZoomIn = () => {
        if (controlsRef.current) {
            const camera = controlsRef.current.object;
            camera.position.multiplyScalar(0.85);
            controlsRef.current.update();
        }
    };

    const handleZoomOut = () => {
        if (controlsRef.current) {
            const camera = controlsRef.current.object;
            camera.position.multiplyScalar(1.15);
            controlsRef.current.update();
        }
    };

    const toggleAutoRotate = () => {
        setAutoRotate(prev => !prev);
    };

    // Pointer events for click-and-hold drag (mouse and touch)
    const handlePointerDown = (e) => {
        // Only trigger on primary button (left click) or touch
        if (e.button !== undefined && e.button !== 0) return;
        isDraggingRef.current = true;
        lastMouseXRef.current = e.clientX;
        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
            // Ignore if pointer capture fails
        }
    };

    const handlePointerMove = (e) => {
        if (!isDraggingRef.current || lastMouseXRef.current === null) return;
        const deltaX = e.clientX - lastMouseXRef.current;
        const sensitivity = 0.009;
        cursorRotationRef.current.target += deltaX * sensitivity;
        lastMouseXRef.current = e.clientX;
    };

    const handlePointerUp = (e) => {
        isDraggingRef.current = false;
        lastMouseXRef.current = null;
        try {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                e.currentTarget.releasePointerCapture(e.pointerId);
            }
        } catch {
            // Ignore
        }
    };

    const handlePointerCancel = (e) => {
        isDraggingRef.current = false;
        lastMouseXRef.current = null;
    };

    if (modelError) {
        return (
            <div style={{
                position: 'relative',
                width: '100%',
                minHeight: '380px',
                borderRadius: '10px',
                overflow: 'hidden',
                backgroundColor: '#0f172a',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                color: '#fff'
            }}>
                <AlertCircle size={44} color="#f87171" style={{ marginBottom: '12px' }} />
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>3D Model Unavailable</h4>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', maxWidth: '360px' }}>
                    There was an issue rendering this vehicle's 3D asset.
                </p>
                {onSwitchToGallery && (
                    <button
                        type="button"
                        onClick={onSwitchToGallery}
                        style={{
                            padding: '8px 18px',
                            backgroundColor: '#0284c7',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        View Photo Gallery
                    </button>
                )}
            </div>
        );
    }

    return (
        <div 
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            style={{ 
                position: 'relative', 
                width: '100%', 
                height: '480px',
                minHeight: '320px', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                backgroundColor: '#090d16',
                boxShadow: 'inset 0 0 80px rgba(0,0,0,0.8)',
                touchAction: 'none',
                userSelect: 'none',
                cursor: 'grab'
            }}
            id="car-360-viewer-container"
        >
            {/* Top Interactive Status Bar */}
            <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                right: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10,
                pointerEvents: 'none'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    color: '#38bdf8',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.6px',
                    textTransform: 'uppercase',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                    <RotateCw size={14} className={autoRotate ? 'animate-spin' : ''} />
                    <span>360° Interactive 3D Model</span>
                </div>

                {onSwitchToGallery && (
                    <button
                        type="button"
                        onClick={onSwitchToGallery}
                        style={{
                            pointerEvents: 'auto',
                            backgroundColor: 'rgba(255, 255, 255, 0.12)',
                            color: '#fff',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backdropFilter: 'blur(8px)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)'}
                    >
                        Switch to Photos
                    </button>
                )}
            </div>

            {/* Gesture Hint Banner at Bottom Center */}
            <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                color: '#e2e8f0',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.3px',
                backdropFilter: 'blur(6px)',
                zIndex: 10,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
                Click and drag to rotate 360° &bull; Pinch or scroll to zoom
            </div>

            {/* Overlay Control Floating Panel */}
            <div style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                zIndex: 10
            }}>
                {/* Reset View Button */}
                <button
                    type="button"
                    onClick={handleResetView}
                    title="Reset Camera View"
                    aria-label="Reset View"
                    style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(30, 41, 59, 0.85)',
                        color: '#f8fafc',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backdropFilter: 'blur(6px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.85)'}
                >
                    <RefreshCw size={17} />
                </button>

                {/* Auto Rotate Toggle Button */}
                <button
                    type="button"
                    onClick={toggleAutoRotate}
                    title={autoRotate ? "Pause Auto Rotation" : "Start Auto Rotation"}
                    aria-label="Toggle Auto Rotation"
                    style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: autoRotate ? '#0284c7' : 'rgba(30, 41, 59, 0.85)',
                        color: '#f8fafc',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backdropFilter: 'blur(6px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        transition: 'background-color 0.2s'
                    }}
                >
                    <RotateCw size={17} />
                </button>

                {/* Zoom In */}
                <button
                    type="button"
                    onClick={handleZoomIn}
                    title="Zoom In"
                    aria-label="Zoom In"
                    style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(30, 41, 59, 0.85)',
                        color: '#f8fafc',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backdropFilter: 'blur(6px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.85)'}
                >
                    <ZoomIn size={17} />
                </button>

                {/* Zoom Out */}
                <button
                    type="button"
                    onClick={handleZoomOut}
                    title="Zoom Out"
                    aria-label="Zoom Out"
                    style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(30, 41, 59, 0.85)',
                        color: '#f8fafc',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backdropFilter: 'blur(6px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.85)'}
                >
                    <ZoomOut size={17} />
                </button>
            </div>

            {/* 3D Canvas */}
            <ModelErrorBoundary onFallback={onSwitchToGallery}>
                <Canvas
                    shadows
                    camera={{ position: [2.8, 1.4, 3.2], fov: 40 }}
                    gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
                    style={{ width: '100%', height: '100%', cursor: 'grab' }}
                    onCreated={({ gl, scene }) => {
                        gl.toneMapping = THREE.ACESFilmicToneMapping;
                        gl.toneMappingExposure = 1.0;
                        scene.background = new THREE.Color('#0a0f1d');
                    }}
                >
                    {/* Lighting Rig - Studio Showroom Setup */}
                    <ambientLight intensity={0.9} />
                    <directionalLight
                        position={[10, 15, 10]}
                        intensity={1.8}
                        castShadow
                        shadow-mapSize-width={1024}
                        shadow-mapSize-height={1024}
                        shadow-camera-near={0.5}
                        shadow-camera-far={50}
                        shadow-camera-left={-10}
                        shadow-camera-right={10}
                        shadow-camera-top={10}
                        shadow-camera-bottom={-10}
                        shadow-bias={-0.0001}
                    />
                    <directionalLight position={[-10, 10, -10]} intensity={1.0} color="#e0f2fe" />
                    <directionalLight position={[0, -5, 0]} intensity={0.3} color="#64748b" />
                    <spotLight
                        position={[0, 12, 0]}
                        intensity={1.2}
                        angle={0.6}
                        penumbra={0.8}
                        castShadow
                    />

                    {/* Showroom Ground Grid / Shadow Plane */}
                    <mesh 
                        rotation={[-Math.PI / 2, 0, 0]} 
                        position={[0, -0.01, 0]} 
                        receiveShadow
                    >
                        <planeGeometry args={[40, 40]} />
                        <shadowMaterial opacity={0.4} />
                    </mesh>

                    {/* Circular Pedestal Ring */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]}>
                        <ringGeometry args={[2.5, 2.55, 64]} />
                        <meshBasicMaterial color="#0284c7" opacity={0.4} transparent />
                    </mesh>

                    {/* Center and Render 3D Model inside smooth rotating wrapper with Suspense */}
                    <Suspense fallback={<CanvasLoadingIndicator />}>
                        <RotatingModelWrapper 
                            url={resolvedUrl} 
                            cursorRotationRef={cursorRotationRef} 
                        />
                    </Suspense>

                    {/* Interactive Orbit Controls with smooth damping */}
                    <OrbitControls
                        ref={controlsRef}
                        makeDefault
                        enableDamping
                        dampingFactor={0.06}
                        autoRotate={autoRotate}
                        autoRotateSpeed={1.8}
                        minDistance={1.2}
                        maxDistance={15}
                        maxPolarAngle={Math.PI / 2 + 0.05} // Prevent flipping underneath floor
                        minPolarAngle={0.1}
                    />
                </Canvas>
            </ModelErrorBoundary>
        </div>
    );
};

export default CarViewer360;
