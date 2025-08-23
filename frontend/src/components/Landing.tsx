"use client"
import Navbar from "./Navbar"
import { Vortex } from "./ui/vortex"
import { World, GlobeConfig, Position } from "./ui/globe" 

const Landing = () => {

const myGlobeData: Position[] = [
  { order: 1, startLat: 34.0522, startLng: -118.2437, endLat: 51.5074, endLng: -0.1278, arcAlt: 0.3, color: "#6C45FF" }, // Los Angeles → London
  { order: 2, startLat: -33.8688, startLng: 151.2093, endLat: 35.6895, endLng: 139.6917, arcAlt: 0.4, color: "#6C45FF" }, // Sydney → Tokyo
  { order: 3, startLat: 40.7128, startLng: -74.0060, endLat: 48.8566, endLng: 2.3522, arcAlt: 0.25, color: "#6C45FF" }, // New York → Paris
  { order: 4, startLat: 55.7558, startLng: 37.6173, endLat: 28.6139, endLng: 77.2090, arcAlt: 0.35, color: "#6C45FF" }, // Moscow → New Delhi
  { order: 5, startLat: -23.5505, startLng: -46.6333, endLat: -34.6037, endLng: -58.3816, arcAlt: 0.4, color: "#6C45FF" }, // São Paulo → Buenos Aires
  { order: 6, startLat: 30.0444, startLng: 31.2357, endLat: 41.0082, endLng: 28.9784, arcAlt: 0.3, color: "#6C45FF" }, // Cairo → Istanbul
  { order: 7, startLat: 1.3521, startLng: 103.8198, endLat: -26.2041, endLng: 28.0473, arcAlt: 0.45, color: "#6C45FF" }, // Singapore → Johannesburg
];


  const myGlobeConfig: GlobeConfig = {
    pointSize: 2,
    globeColor: "#1d072e",
    showAtmosphere: true,
    atmosphereColor: "#ffffff",
    atmosphereAltitude: 0.1,
    emissive: "#000000",
    emissiveIntensity: 0.1,
    shininess: 1.5,
    polygonColor: "rgba(255,255,255,0.7)",
    ambientLight: "#333333",
    directionalLeftLight: "#ffffff",
    directionalTopLight: "#ffffff",
    pointLight: "#ffffff",
    arcTime: 2000,
    arcLength: 0.9,
    rings: 3,
    maxRings: 4,
    initialPosition: { lat: 28.6139, lng: 77.2090 },
    autoRotate: true,
    autoRotateSpeed: 1,
  };

  return (
    <>
      <Navbar />
      <div className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
        <div className="absolute inset-0 z-0">
          <World globeConfig={myGlobeConfig} data={myGlobeData} />
        </div>

        <Vortex
          backgroundColor="transparent"
          particleCount={3000}
          rangeY={200}
          className="flex items-center flex-col justify-center px-4 md:px-10 py-4 w-full h-full relative z-20"
        >
          <h1 className="text-white text-4xl md:text-7xl font-bold text-center relative z-20 leading-tight">
            Obscuron
          </h1>
          <p className="text-gray-300 text-lg md:text-2xl max-w-2xl mt-6 text-center relative z-20">
            Empower open source with <span className="text-purple-400">Encrypted bounties</span> that reward meaningful
            contributions
          </p>
        </Vortex>
      </div>

    </>
  )
}

export default Landing