import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import StingrayBarModel from "./StingrayBarModel.jsx";

export default function BarVisualization({ pitch = 0, roll = 0, yaw = 0 }) {
  return (
    <div className="bar-visualization-panel">
      <Canvas camera={{ position: [0, 1.1, 6.4], fov: 42 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[3, 4, 6]} intensity={2} />
        <pointLight position={[0, 1.5, 3]} intensity={1.6} color="#0ea5e9" />

        <StingrayBarModel pitch={pitch} roll={roll} yaw={yaw} />

        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}