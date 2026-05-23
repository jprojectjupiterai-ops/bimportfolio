"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, FileText, Mail } from "lucide-react";
import { useRef } from "react";
import Image from "next/image";

export default function Overlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-10 pointer-events-none">
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center px-8 md:px-24">
        <motion.div 
          style={{ y: y1, opacity }}
          className="max-w-7xl w-full flex flex-col md:flex-row items-center gap-12 md:gap-24 bg-black/50 backdrop-blur-sm p-8 md:p-12 rounded-2xl border border-white/5 shadow-2xl"
        >
          {/* Profile Photo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-56 h-56 md:w-96 md:h-96 shrink-0 relative overflow-hidden rounded-sm"
          >
            <Image 
              src="/PROFILE IMAGE_AR. JOHN PAUL BUERANO MAULION. UAP.jpg" 
              alt="John Paul Maulion" 
              fill
              className="object-cover object-top"
              priority
            />
          </motion.div>

          {/* Text Content */}
          <div className="flex-1 flex flex-col items-start text-left">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-montserrat text-accent tracking-widest uppercase text-xs md:text-sm font-semibold mb-4"
            >
              REGISTERED AND LICENSED ARCHITECT | BIM SPECIALIST | BIM COORDINATOR
            </motion.h2>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="font-montserrat text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground mb-6"
            >
              JOHN PAUL<br />MAULION
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="font-montserrat font-light text-muted-foreground text-base md:text-lg max-w-2xl text-balance mb-12 text-gray-300 leading-relaxed"
            >
              Crafting meticulous spatial experiences. Specializing in minimalist architecture and Building Information Modeling.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="pointer-events-auto flex items-center gap-4 flex-wrap"
            >
              <a 
                href="/Information_John_Paul_Maulion_CV.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full transition-all duration-300 group"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium tracking-wide">CURRICULUM VITAE</span>
              </a>

              <a 
                href="https://www.linkedin.com/in/john-paul-maulion-b462242b7/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 hover:text-[#0a66c2] backdrop-blur-md border border-white/20 text-white w-12 h-12 rounded-full transition-all duration-300"
                title="LinkedIn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>

              <a 
                href="mailto:maulion16john@gmail.com" 
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full transition-all duration-300 group"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium tracking-wide">maulion16john@gmail.com</span>
              </a>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          style={{ opacity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-widest text-gray-400">Scroll to Explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ArrowDown className="w-4 h-4 text-gray-400" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
