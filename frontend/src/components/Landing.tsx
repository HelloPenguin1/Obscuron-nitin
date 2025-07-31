"use client"
import Navbar from "./Navbar"
import { ContainerScroll } from "./ui/container-scroll-animation"
import { useAuth } from "./Layout"
import { GoogleGeminiEffect } from "./ui/google-gemini-effect"
import { useScroll, useTransform } from "framer-motion"
import React from "react"
import { Vortex } from "./ui/vortex"

const Landing = () => {
  const auth = useAuth()
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

  return (
    <>
      <Navbar />

      {/* Hero Section with Vortex */}
      <div className="w-full mx-auto rounded-md h-screen overflow-hidden">
        <Vortex
          backgroundColor="black"
          className="flex items-center flex-col justify-center px-2 md:px-10 py-4 w-full h-full"
        >
          <h2 className="text-white text-2xl md:text-6xl font-bold text-center relative z-10">Obscuron</h2>
          <p className="text-white text-sm md:text-2xl max-w-xl mt-6 text-center relative z-10">
            Visualize the Impact of Your Open Source Projects
          </p>

        </Vortex>
      </div>

      {/* Google Gemini Effect Section */}
      <div ref={containerRef} className="relative h-[200vh] bg-black pt-10">
        <div className="sticky top-0 left-0 right-0 h-screen w-screen flex items-center justify-center">
          <div className="w-full h-full relative">
            {/* Rays Background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <GoogleGeminiEffect
                pathLengths={pathLengths}
                title="Powered by AI"
                description="Advanced analytics and insights for your projects"
                className="w-full h-full"
              />
            </div>

            {/* Centered Content */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center">
                <h3 className="text-4xl md:text-6xl font-bold text-white mb-4">Advanced Analytics</h3>
                <p className="text-xl md:text-2xl text-gray-300 max-w-2xl">
                  Get deep insights into your open source project's performance and impact
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Container Scroll Animation Section */}
      <section className="w-full flex justify-center items-center bg-black py-20 overflow-hidden">
        <ContainerScroll
          titleComponent={
            <>
              <h1 className="text-4xl font-semibold text-white">
                Visualize the Impact of Your <br />
                <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">Open Source Projects</span>
              </h1>
            </>
          }
        >
          <img
            src={`/landingimage.jpg`}
            alt="hero"
            height={720}
            width={1400}
            className="mx-auto rounded-2xl object-cover h-full object-left-top"
            draggable={false}
          />
        </ContainerScroll>
      </section>
    </>
  )
}

export default Landing
