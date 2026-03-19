import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@overlens/legacy-components';
import './GalleryCarousel.css';

export default function GalleryCarousel({ images }) {
  if (!images || images.length === 0) return null;

  return (
    <Carousel className="carousel-container" opts={{ align: 'start' }}>
      <CarouselContent>
        {images.map((img, index) => (
          <CarouselItem key={index} className="carousel-slide">
            <img src={img.url} alt={`Seed preview ${index + 1}`} loading="lazy" />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
