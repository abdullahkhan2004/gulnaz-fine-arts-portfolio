import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Gallery({ images = [] }) {
  const [lightbox, setLightbox] = useState(null)
  return (
    <>
      <div className="masonry" role="list">
        {images.map((src, idx) => (
          <motion.figure
            layout
            key={src + idx}
            className="masonry-item card"
            onClick={() => setLightbox(src)}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
          >
            <img src={src} alt={`Drawing ${idx + 1}`} loading="lazy" />
            <figcaption>{src.split('/').pop()}</figcaption>
          </motion.figure>
        ))}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.img
              src={lightbox}
              alt="lightbox"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            />
            <button className="close-btn" onClick={() => setLightbox(null)}>×</button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
