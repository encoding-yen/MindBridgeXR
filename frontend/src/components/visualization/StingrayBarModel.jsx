import { useLoader } from "@react-three/fiber";
import { TextureLoader, RepeatWrapping } from "three";
import carbonTextureImage from "../../assets/textures/carbon-fiber.png";

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

export default function StingrayBarModel({ pitch = 0, roll = 0, yaw = 0 }) {
  const carbonTexture = useLoader(TextureLoader, carbonTextureImage);

  carbonTexture.wrapS = RepeatWrapping;
  carbonTexture.wrapT = RepeatWrapping;
  carbonTexture.repeat.set(12, 1);

  return (
    <group
      rotation={[
        degreesToRadians(pitch),
        degreesToRadians(yaw),
        degreesToRadians(roll),
      ]}
      scale={0.82}
    >
      <MainBar texture={carbonTexture} />
      <Grip position={[-2.05, 0, 0]} texture={carbonTexture} />
      <Grip position={[2.05, 0, 0]} texture={carbonTexture} />
      <EndCap position={[-2.78, 0, 0]} />
      <EndCap position={[2.78, 0, 0]} />
      <CenterLight />
    </group>
  );
}

function MainBar({ texture }) {
  return (
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.12, 0.12, 5.35, 96]} />
      <meshStandardMaterial
        map={texture}
        color="#25282d"
        roughness={0.62}
        metalness={0.18}
      />
    </mesh>
  );
}

function Grip({ position, texture }) {
  return (
    <mesh position={position} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.128, 0.128, 0.8, 96]} />
      <meshStandardMaterial
        map={texture}
        color="#1b1f25"
        roughness={0.85}
        metalness={0.12}
      />
    </mesh>
  );
}

function EndCap({ position }) {
  return (
    <mesh position={position} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.13, 0.13, 0.22, 96]} />
      <meshStandardMaterial color="#4b5563" roughness={0.32} metalness={0.85} />
    </mesh>
  );
}

function CenterLight() {
  return (
    <>
      <mesh position={[0, 0.123, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.035, 32]} />
        <meshStandardMaterial
          color="#0ea5e9"
          emissive="#0ea5e9"
          emissiveIntensity={1.8}
        />
      </mesh>

      <pointLight
        position={[0, 0.16, 0.25]}
        color="#0ea5e9"
        intensity={0.35}
        distance={1.5}
      />
    </>
  );
}