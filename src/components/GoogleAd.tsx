import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface GoogleAdProps {
  slot?: string;
  format?: 'auto' | 'fluid';
  responsive?: boolean;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const GoogleAd: React.FC<GoogleAdProps> = ({ 
  slot = '', 
  format = 'auto',
  responsive = true,
  style
}) => {
  const { data: publisherId } = useQuery({
    queryKey: ['adsensePublisherId'],
    queryFn: async () => {
      // In production, this would fetch from your backend
      return 'ca-pub-5874765168681596';
    },
  });

  useEffect(() => {
    try {
      if (publisherId) {
        // Check if script already exists
        const existingScript = document.querySelector('script[src*="pagead2.googlesyndication.com"]');
        
        if (!existingScript) {
          // Load AdSense script only if it hasn't been loaded
          const script = document.createElement('script');
          script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
          script.crossOrigin = 'anonymous';
          script.async = true;
          document.head.appendChild(script);

          script.onerror = (error) => {
            console.error('Error loading AdSense script:', error);
          };
        }

        // Initialize ads with a delay to ensure script is loaded
        setTimeout(() => {
          if (window.adsbygoogle) {
            try {
              window.adsbygoogle.push({});
            } catch (error) {
              console.error('Error initializing ad:', error);
            }
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error in AdSense setup:', error);
    }
  }, [publisherId]);

  if (!publisherId) return null;

  return (
    <div className="w-full overflow-hidden my-4">
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          ...style
        }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
};

export default GoogleAd;