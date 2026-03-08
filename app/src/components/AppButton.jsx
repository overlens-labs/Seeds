import { useState } from 'react';
import './AppButton.css';

export default function AppButton({ text = "Copy Code", contentToCopy, variant = "primary" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!contentToCopy) return;
    
    try {
      await navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button 
      className={`app-button ${variant} ${copied ? 'copied' : ''}`}
      onClick={handleCopy}
    >
      {copied ? (
        <>
          Copied
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </>
      ) : (
        text
      )}
    </button>
  );
}
