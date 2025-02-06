import React, { useEffect, useState } from 'react';
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
  const [adError, setAdError] = useState<string | null>(null);
  const { data: publisherId } = useQuery({
    queryKey: ['adsensePublisherId'],
    queryFn: async () => {
      // In production, this would fetch from your backend
      return 'ca-pub-5874765168681596';
    },
  });

  useEffect(() => {
    const loadAdsenseScript = async () => {
      try {
        if (!publisherId) return;

        // Check if script already exists
        const existingScript = document.querySelector('script[src*="pagead2.googlesyndication.com"]');
        
        if (!existingScript) {
          return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
            script.crossOrigin = 'anonymous';
            script.async = true;
            
            script.onload = () => resolve(true);
            script.onerror = (error) => {
              console.error('Error loading AdSense script:', error);
              setAdError('Failed to load advertisement');
              reject(error);
            };
            
            document.head.appendChild(script);
          });
        }
      } catch (error) {
        console.error('Error in AdSense setup:', error);
        setAdError('Failed to initialize advertisement');
      }
    };

    const initializeAd = () => {
      if (window.adsbygoogle) {
        try {
          window.adsbygoogle.push({});
        } catch (error) {
          console.error('Error initializing ad:', error);
          setAdError('Failed to display advertisement');
        }
      }
    };

    // Load script and initialize ad with proper timing
    loadAdsenseScript().then(() => {
      // Wait for script to be properly loaded
      setTimeout(initializeAd, 1000);
    }).catch((error) => {
      console.error('Failed to load AdSense:', error);
      setAdError('Advertisement unavailable');
    });

  }, [publisherId]);

  if (adError) {
    // Return an empty div with min height to prevent layout shifts
    return <div className="min-h-[100px] bg-transparent" />;
  }

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