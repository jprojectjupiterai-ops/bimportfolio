"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { ProjectCategory, ProjectImage, ProjectGroup } from "@/lib/projects";
import SmartLightbox from "./SmartLightbox";
import { ZoomIn, Play } from "lucide-react";

export default function Projects({ categories }: { categories: ProjectCategory[] }) {
  const [selectedItem, setSelectedItem] = useState<ProjectImage | null>(null);

  const renderProjectItem = (item: ProjectImage, i: number, className: string = "") => (
    <motion.div
      key={item.url}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: (i % 10) * 0.1 }}
      className={`group relative bg-muted/30 rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-shadow duration-500 ${className}`}
      onClick={() => setSelectedItem(item)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {item.type === "image" ? (
        <img 
          src={item.url} 
          alt={item.name}
          loading="lazy"
          className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105 pointer-events-none grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
      ) : item.type === "video" ? (
        <div className="w-full h-full relative pointer-events-none bg-black">
          <video 
            src={item.url}
            className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100"
            muted
            loop
            playsInline
            autoPlay
          />
        </div>
      ) : (
        <div className="w-full aspect-[4/5] flex items-center justify-center bg-zinc-900 text-white p-6 text-center">
          <span className="font-medium tracking-wide uppercase text-sm leading-relaxed">{item.name}</span>
          <span className="absolute top-4 right-4 text-[10px] tracking-wider font-bold bg-accent/20 text-accent px-2 py-1 rounded">PDF</span>
        </div>
      )}
      
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-90 group-hover:scale-100">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20 text-white shadow-[0_0_30px_rgba(255,255,255,0.2)] pointer-events-none flex items-center justify-center">
            {item.type === "video" ? <Play className="w-6 h-6" /> : <ZoomIn className="w-6 h-6" />}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderGroupRecursive = (group: ProjectGroup, depth: number = 0, isBIM: boolean = false) => {
    // Elegant Typography based on depth
    const HeadingTag = depth === 0 ? "h4" : depth === 1 ? "h5" : "h6";
    const textSize = depth === 0 ? "text-2xl" : depth === 1 ? "text-xl" : "text-lg";
    const tracking = depth === 0 ? "tracking-[0.2em]" : "tracking-[0.1em]";
    const padding = depth > 0 ? "pl-6 md:pl-12 border-l border-white/10" : "";

    const logos = group.items.filter(item => item.isLogo);
    const regularItems = group.items.filter(item => !item.isLogo);

    return (
      <div key={group.name} className={`space-y-12 ${padding} w-full`}>
        {/* Render Group Title */}
        <HeadingTag className={`${textSize} font-light ${tracking} text-muted-foreground uppercase flex items-center gap-6`}>
          {group.name.replace(/_/g, " ")}
          {depth === 0 && <div className="h-[1px] flex-1 bg-gradient-to-r from-white/20 to-transparent" />}
        </HeadingTag>
        
        {/* Render Title Logos first if BIM */}
        {isBIM && depth === 0 && logos.length > 0 && (
           <div className="grid grid-cols-1 gap-8 w-full">
              {logos.map((logo, i) => renderProjectItem(logo, i, "w-full h-auto max-h-[70vh] object-contain"))}
           </div>
        )}
        
        {/* Render regular items in this folder using fluid Masonry Layout */}
        {regularItems.length > 0 && (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {regularItems.map((item, i) => renderProjectItem(item, i, "break-inside-avoid w-full mb-8"))}
          </div>
        )}
        
        {/* Recursively render subgroups */}
        {group.subGroups.length > 0 && (
          <div className="space-y-24 mt-16">
            {group.subGroups.map(subGroup => renderGroupRecursive(subGroup, depth + 1, isBIM))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#050505] min-h-screen py-32 px-8 md:px-24 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Category Navigation Tabs */}
        <div className="flex flex-wrap gap-6 mb-20 md:justify-start justify-center">
          {categories.map((category, i) => {
            const colorClasses = "border-white/20 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.02)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]";

            return (
              <motion.button
                key={category.name}
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                onClick={() => {
                  const el = document.getElementById(category.name);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`px-8 py-3 border border-opacity-50 text-[11px] md:text-sm font-semibold tracking-[0.2em] uppercase transition-all duration-500 backdrop-blur-sm ${colorClasses}`}
              >
                {category.name.replace(/_/g, " ")}
              </motion.button>
            );
          })}
        </div>

        <div className="mb-24 text-center md:text-left">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-light tracking-[0.15em] mb-6 uppercase text-white/90"
          >
            Selected Works
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 120 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-[2px] bg-accent" 
          />
        </div>

        <div className="space-y-40">
          {categories.map((category) => {
            const isBIM = category.name === "BUILDING INFORMATION MODELING";
            const isArch = category.name === "ARCHITECTURAL DESIGN AND LAYOUTS";
            const displayCategoryName = category.name.replace(/_/g, " ");

            return (
              <div key={category.name} id={category.name} className="relative scroll-mt-32">
                <h3 className="text-3xl md:text-4xl font-normal tracking-[0.2em] uppercase mb-16 text-foreground/90 border-b border-white/10 pb-6">
                  {displayCategoryName}
                </h3>
                
                {/* ARCHITECTURAL DESIGNER: Single Logo Centered */}
                {isArch && category.standaloneItems.length > 0 && (
                  <div className="flex justify-center mb-32">
                    {category.standaloneItems.filter(item => item.isLogo).map((item, i) => (
                      <div key={item.url} className="w-full max-w-3xl relative">
                        {renderProjectItem(item, i, "w-full h-auto")}
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-32">
                  {category.groups.map(group => renderGroupRecursive(group, 0, isBIM))}
                </div>

                {/* BIM: Standalone photos (BIM Team) at the bottom */}
                {isBIM && category.standaloneItems.length > 0 && (
                  <div className="mt-40 pt-16 border-t border-white/10">
                    <h4 className="text-2xl font-light tracking-[0.2em] text-muted-foreground uppercase mb-12 flex items-center gap-6">
                      BIM TEAM
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-white/20 to-transparent" />
                    </h4>
                    <div className="columns-1 md:columns-2 gap-8 space-y-8">
                      {category.standaloneItems.map((item, i) => renderProjectItem(item, i, "break-inside-avoid w-full mb-8"))}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      <SmartLightbox 
        isOpen={!!selectedItem} 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </div>
  );
}
