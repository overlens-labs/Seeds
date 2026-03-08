import { useRef } from 'react';
import './GalleryCarousel.css';

export default function GalleryCarousel({ images }) {
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 600;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="carousel-container">
      <button className="nav-btn prev" onClick={() => scroll('left')} aria-label="Previous image">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      
      <div className="carousel-track" ref={carouselRef}>
        {images.map((img, index) => (
          <div key={index} className="carousel-slide">
            <img src={img.url} alt={`Seed preview ${index + 1}`} loading="lazy" />
          </div>
        ))}
      </div>
      
      <button className="nav-btn next" onClick={() => scroll('right')} aria-label="Next image">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  );
}
