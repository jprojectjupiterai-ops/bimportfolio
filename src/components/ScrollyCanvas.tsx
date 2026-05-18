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

  // Load images concurrently but gracefully handle loading states
  useEffect(() => {
    const newImages: HTMLImageElement[] = [];

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      const frameIndex = i.toString().padStart(2, "0");
      img.src = `/sequence/frame_${frameIndex}_delay-0.076s.webp`;
      
      img.onload = () => {
        // Redraw if it's the current frame being requested (fallback to first frame)
        if (i === 0 && canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          // Only draw if we haven't scrolled yet
          if (scrollYProgress.get() === 0) {
            ctx?.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        }
      };
      
      newImages.push(img);
    }
    
    setImages(newImages);
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
      if (canvasRef.current && images[frameIndex] && images[frameIndex].complete) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(
          images[frameIndex],
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
      } else if (canvasRef.current && images[0] && images[0].complete) {
        // Fallback to frame 0 if current frame isn't loaded yet
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(images[0], 0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    });

    return () => unsubscribe();
  }, [images, scrollYProgress]);

  return (
    <div ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
        />
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80 pointer-events-none" />
      </div>
      {children}
    </div>
  );
}
