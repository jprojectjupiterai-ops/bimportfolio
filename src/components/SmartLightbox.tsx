"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import { useState } from "react";
import type { ProjectCategory, ProjectImage } from "@/lib/projects";
import Image from "next/image";

export default function SmartLightbox({
  isOpen,
  item,
  onClose,
}: {
  isOpen: boolean;
  item: ProjectImage | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8"
          onClick={onClose}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-50 bg-black/50 p-2 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center bg-zinc-900 rounded-lg overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {item.type === "image" ? (
              <img
                src={item.url}
                alt={item.name}
                className="w-full h-full object-contain pointer-events-none"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            ) : item.type === "video" ? (
              <video 
                src={item.url}
                className="w-full h-full max-h-[85vh] object-contain outline-none bg-black"
                controls
                autoPlay
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
              />
            ) : item.type === "youtube" ? (
              <iframe
                src={item.url.replace('watch?v=', 'embed/')}
                className="w-full h-full max-h-[85vh] bg-black"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={item.name}
              />
            ) : (
              <div className="w-full h-full relative" onContextMenu={(e) => e.preventDefault()}>
                <iframe
                  src={`${item.url}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-full bg-white"
                  title={item.name}
                />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
              <h3 className="text-white font-medium text-lg tracking-wide">{item.name}</h3>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
