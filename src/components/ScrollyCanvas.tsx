"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

const FRAME_COUNT = 65;

export default function ScrollyCanvas({ children }: { children?: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Load images sequentially to prevent network congestion
  useEffect(() => {
    let isCancelled = false;
    const loadedImages: HTMLImageElement[] = [];

    const loadSequential = async () => {
      for (let i = 0; i < FRAME_COUNT; i++) {
        if (isCancelled) break;
        
        await new Promise((resolve) => {
          const img = new Image();
          const frameIndex = i.toString().padStart(2, "0");
          img.src = `/sequence/frame_${frameIndex}_delay-0.076s.png`;
          
          img.onload = () => {
            loadedImages.push(img);
            if (i === 0 && canvasRef.current) {
              const ctx = canvasRef.current.getContext("2d");
              ctx?.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
              setImages([...loadedImages]);
            } else if (i % 5 === 0 || i === FRAME_COUNT - 1) {
              // Update state occasionally to allow smooth scrolling as frames load
              setImages([...loadedImages]);
            }
            resolve(true);
          };
          
          img.onerror = () => resolve(false);
        });
      }
    };

    loadSequential();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Update canvas on scroll
  useEffect(() => {
    if (images.length !== FRAME_COUNT || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const unsubscribe = scrollYProgress.on("change", (latest) => {
      // Calculate current frame (0 to 64)
      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.floor(latest * FRAME_COUNT)
      );

      // Handle canvas resize on window resize if needed
      if (canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(
          images[frameIndex],
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
      }
    });

    return () => unsubscribe();
  }, [images, scrollYProgress]);

  // Handle resizing the canvas
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        // Set actual size in memory (scaled to account for extra pixel density)
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        
        // Redraw current frame
        if (images.length === FRAME_COUNT) {
          const frameIndex = Math.min(
            FRAME_COUNT - 1,
            Math.floor(scrollYProgress.get() * FRAME_COUNT)
          );
          const ctx = canvasRef.current.getContext("2d");
          ctx?.drawImage(
            images[frameIndex],
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
        }
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [images, scrollYProgress]);

  return (
    <div ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover"
        />
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80 pointer-events-none" />
      </div>
      {children}
    </div>
  );
}
