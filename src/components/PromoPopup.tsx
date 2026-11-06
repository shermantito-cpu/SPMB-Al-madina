import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sparkles } from 'lucide-react';

const images = [
  '/ke1.jpeg',
  '/ke2.jpeg',
  '/ke3.jpeg',
  '/ke4.jpeg',
  '/ke5.jpeg',
  '/ke6.jpeg'
];

export default function PromoPopup({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000); // 4 seconds per slide
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors"
        >
          <X size={24} />
        </button>

        {/* Carousel Area */}
        <div className="relative w-full h-[60vh] sm:h-[70vh] max-h-[700px] bg-slate-900 overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.div
              key={index}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }} // Sangat pelan dan smooth
              className="absolute inset-0 w-full h-full"
            >
              {/* Blurred Background to fill empty spaces beautifully */}
              <img
                src={images[index]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-50 scale-110"
              />
              {/* Main Image, fully visible without cropping */}
              <img
                src={images[index]}
                alt={`Promo ${index + 1}`}
                className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl"
              />
            </motion.div>
          </AnimatePresence>
          
          {/* Indicators */}
          <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2">
            {images.map((_, i) => (
              <div 
                key={i} 
                className={`h-2.5 rounded-full transition-all duration-500 ${i === index ? 'w-8 bg-emerald-500 shadow-md' : 'w-2.5 bg-white/70'}`}
              />
            ))}
          </div>
        </div>

        {/* Action Area */}
        <div className="px-6 py-6 sm:px-10 sm:py-7 text-center bg-white border-t border-slate-100 flex justify-center">
          <div className="relative group w-full sm:w-auto inline-flex items-center justify-center">
            {/* Ambient Pulse Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 rounded-2xl blur-sm opacity-40 group-hover:opacity-75 transition-opacity duration-300 animate-pulse-glow pointer-events-none" />

            <button
              onClick={onClose}
              className="relative w-full sm:w-auto inline-flex items-center justify-center gap-3.5 px-8 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:via-emerald-600 hover:to-teal-700 text-white text-[16px] sm:text-[17px] font-semibold tracking-wide rounded-2xl shadow-xl shadow-emerald-950/20 border border-emerald-400/30 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              {/* Subtle light sweep animation */}
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-btn-shine pointer-events-none" />

              <Sparkles className="w-4 h-4 text-emerald-300 shrink-0 animate-pulse" />
              
              <span className="drop-shadow-sm">Yuk Lanjut Mendaftar</span>

              <span className="w-7 h-7 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-emerald-800 transition-all duration-300 shadow-sm shrink-0">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
