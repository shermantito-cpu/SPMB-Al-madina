import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';

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
        <div className="px-6 py-6 sm:px-10 sm:py-8 text-center bg-white border-t border-slate-100 flex justify-center">
          <button
            onClick={onClose}
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-3.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white text-[17px] font-semibold tracking-wide rounded-full shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/40 border border-emerald-600/50 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
          >
            Yuk Lanjut Mendaftar
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
