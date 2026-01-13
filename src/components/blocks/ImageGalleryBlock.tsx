import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ImageGalleryData } from './types';
import { getStorageUrl } from '../../config/storage';

interface ImageGalleryBlockProps {
  data: ImageGalleryData;
}

export function ImageGalleryBlock({ data }: ImageGalleryBlockProps) {
  const { images, columns = 2 } = data;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % images.length);
    }
  };

  const goPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
    }
  };

  return (
    <>
      <div className={`grid ${gridCols[columns]} gap-1 w-full`}>
        {images.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group cursor-pointer"
            onClick={() => openLightbox(index)}
          >
            <div className="relative overflow-hidden bg-black aspect-[4/3]">
              <img
                src={getStorageUrl(image.src)}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-sm text-white">{image.caption}</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox - rendered via portal to escape overflow containers */}
      {createPortal(
        <AnimatePresence>
          {lightboxIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
              onClick={closeLightbox}
            >
              {/* Close button */}
              <button
                onClick={closeLightbox}
                className="absolute top-6 right-6 p-3 text-white/60 hover:text-white transition-colors z-10"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goPrev();
                    }}
                    className="absolute left-6 p-3 text-white/60 hover:text-white transition-colors z-10"
                  >
                    <ChevronLeft className="w-12 h-12" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goNext();
                    }}
                    className="absolute right-6 p-3 text-white/60 hover:text-white transition-colors z-10"
                  >
                    <ChevronRight className="w-12 h-12" />
                  </button>
                </>
              )}

              {/* Image */}
              <motion.div
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="max-w-[90vw] max-h-[90vh] flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={getStorageUrl(images[lightboxIndex].src)}
                  alt={images[lightboxIndex].alt}
                  className="max-w-full max-h-[85vh] object-contain"
                />
                {images[lightboxIndex].caption && (
                  <p className="mt-4 text-center text-gray-300 text-lg">
                    {images[lightboxIndex].caption}
                  </p>
                )}
              </motion.div>

              {/* Counter */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm font-mono">
                {lightboxIndex + 1} / {images.length}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
