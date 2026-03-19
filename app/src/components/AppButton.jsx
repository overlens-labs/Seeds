import { useState } from 'react';
import { Button } from '@overlens/legacy-components';
import { CheckLineIcon } from '@overlens/legacy-icons';

export default function AppButton({ text = "Copy Code", contentToCopy, variant = "primary" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!contentToCopy) return;
    try {
      await navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const olVariant = copied ? 'outline' : variant === 'secondary' ? 'outline' : 'default';

  return (
    <Button variant={olVariant} onClick={handleCopy} style={{ minWidth: '140px' }}>
      {copied ? (
        <>
          Copied
          <CheckLineIcon size="sm" />
        </>
      ) : (
        text
      )}
    </Button>
  );
}
