// Landing.tsx
"use client"

import Navbar from "./Navbar"
import { ContainerScroll } from "./ui/container-scroll-animation"
import { GoogleGeminiEffect } from "./ui/google-gemini-effect"
import { useScroll, useTransform } from "framer-motion"
import React from "react"
import { Vortex } from "./ui/vortex"
import { BackgroundBeamsWithCollision } from "./ui/background-beams-with-collision"
import { World, GlobeConfig, Position } from "./ui/globe" // Assuming ./ui/globe.tsx for World

const Landing = () => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const pathLengths = [
    useTransform(scrollYProgress, [0, 0.8], [0, 1]),
    useTransform(scrollYProgress, [0.1, 0.9], [0, 1]),
    useTransform(scrollYProgress, [0.2, 1], [0, 1]),
    useTransform(scrollYProgress, [0.3, 1], [0, 1]),
    useTransform(scrollYProgress, [0.4, 1], [0, 1]),
  ]
  const myGlobeData: Position[] = [
    { order: 1, startLat: 34.0522, startLng: -118.2437, endLat: 51.5074, endLng: 0.1278, arcAlt: 0.3, color: "#ff0000" },
    { order: 2, startLat: -33.8688, startLng: 151.2093, endLat: 35.6895, endLng: 139.6917, arcAlt: 0.4, color: "#00ff00" },
    { order: 3, startLat: 40.7128, startLng: -74.0060, endLat: 48.8566, endLng: 2.3522, arcAlt: 0.25, color: "#0000ff" }, // NYC to Paris
    { order: 4, startLat: 39.9042, startLng: 116.4074, endLat: 31.2304, endLng: 121.4737, arcAlt: 0.35, color: "#ffff00" }, // Beijing to Shanghai
    { order: 5, startLat: -23.5505, startLng: -46.6333, endLat: -34.6037, endLng: -58.3816, arcAlt: 0.4, color: "#ff00ff" }, // Sao Paulo to Buenos Aires
    { order: 6, startLat: 55.7558, startLng: 37.6173, endLat: 52.5200, endLng: 13.4050, arcAlt: 0.3, color: "#00ffff" }, // Moscow to Berlin
    { order: 7, startLat: 1.3521, startLng: 103.8198, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.45, color: "#ffa500" }, // Singapore to Tokyo
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

        <BackgroundBeamsWithCollision className="absolute inset-0 z-10 bg-black/50">
          <></>
        </BackgroundBeamsWithCollision>
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

      <section className="w-full flex justify-center items-center bg-black py-20 overflow-hidden">
        <ContainerScroll
          titleComponent={
            <div className="text-center">
              <h2 className="text-3xl md:text-5xl font-semibold text-white">The Future of Open Source</h2>
              <h1 className="text-4xl md:text-[5.5rem] font-bold mt-2 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                Contribution Rewards
              </h1>
              <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mt-6">
                Say goodbye to unpaid contributions. Welcome to a world where every merged PR, bug fix, and feature
                enhancement is automatically rewarded with crypto bounties.
              </p>
            </div>
          }
        >
          <img
            src={`/landingimage.jpg`}
            alt="Obscuron dashboard showing automated bounty distribution and contributor rewards"
            height={720}
            width={1400}
            className="mx-auto rounded-2xl object-cover h-full w-full object-left-top border border-gray-700 shadow-lg"
            draggable={false}
          />
        </ContainerScroll>
      </section>

      <div ref={containerRef} className="relative h-[200vh] bg-black pt-10">
        <div className="sticky top-0 left-0 right-0 h-screen w-screen flex items-center justify-center">
          <div className="w-full h-full relative">
            <GoogleGeminiEffect
              pathLengths={pathLengths}
              title={<span className="text-white">Built for Trust & Scale</span>}
              description={
                <span className="text-gray-400">
                  Powered by Solana blockchain with Arcium encryption for secure, transparent, and instant reward
                  distribution
                </span>
              }
              className="w-full h-full absolute inset-0"
            />
            {/* Centered Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 text-center">
              <h3 className="text-4xl md:text-6xl font-bold text-white mb-6">Simple. Automated. Fair.</h3>
              <div className="text-lg md:text-xl text-gray-300 max-w-4xl space-y-4">
                <p className="mb-6">
                  <span className="text-purple-400 font-semibold">1. Set Your Bounties:</span> Define reward amounts for
                  different contribution types
                </p>
                <p className="mb-6">
                  <span className="text-blue-400 font-semibold">2. Contributors Code:</span> Developers submit PRs and
                  improvements as usual
                </p>
                <p>
                  <span className="text-green-400 font-semibold">3. Instant Rewards:</span> Approved contributions
                  trigger automatic crypto payouts
                </p>
              </div>
              <div className="mt-8 text-sm md:text-base text-gray-400 max-w-2xl">
                No manual payments. No delays. No disputes. Just pure incentive-driven development.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Landing