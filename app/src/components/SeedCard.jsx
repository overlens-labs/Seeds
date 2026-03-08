import AppButton from './AppButton';
import GalleryCarousel from './GalleryCarousel';
import './SeedCard.css';

export default function SeedCard({ prompt, images }) {
  return (
    <article className="seed-card">
      <div className="prompt-container">
        <p className="prompt-text">
          <span className="prompt-prefix">[YOUR PROMPT HERE] </span> 
          {prompt}
        </p>
        <div className="card-actions">
          <AppButton 
            text="Copy Code" 
            contentToCopy={prompt} 
            variant="primary" 
          />
        </div>
      </div>
      <GalleryCarousel images={images} />
    </article>
  );
}
