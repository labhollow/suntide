import React, { useEffect, useState, useRef } from 'react';
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
  const adRef = useRef<HTMLInsElement>(null);
  const scriptLoaded = useRef(false);
  const [isClient, setIsClient] = useState(false);
  
  const { data: publisherId } = useQuery({
    queryKey: ['adsensePublisherId'],
    queryFn: async () => {
      return 'ca-pub-5874765168681596';
    },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    let mounted = true;
    let adScript: HTMLScriptElement | null = null;
    
    const loadAdsenseScript = async () => {
      if (!publisherId || scriptLoaded.current) return;

      try {
        // Check if script already exists
        const existingScript = document.querySelector('script[src*="pagead2.googlesyndication.com"]');
        
        if (!existingScript) {
          adScript = document.createElement('script');
          adScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
          adScript.crossOrigin = 'anonymous';
          adScript.async = true;
          
          adScript.onload = () => {
            if (mounted) {
              scriptLoaded.current = true;
              setTimeout(tryInitializeAd, 100); // Add small delay before initialization
            }
          };
          
          adScript.onerror = (error) => {
            console.error('Error loading AdSense script:', error);
            if (mounted) {
              setAdError('Failed to load advertisement');
            }
          };
          
          document.head.appendChild(adScript);
        } else {
          scriptLoaded.current = true;
          setTimeout(tryInitializeAd, 100);
        }
      } catch (error) {
        console.error('Error in AdSense setup:', error);
        if (mounted) {
          setAdError('Failed to initialize advertisement');
        }
      }
    };

    const tryInitializeAd = () => {
      if (!window.adsbygoogle || !adRef.current) return;
      
      try {
        // Clear any existing ad content
        if (adRef.current.innerHTML.trim() !== '') {
          adRef.current.innerHTML = '';
        }
        
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('Error initializing ad:', error);
        if (mounted) {
          setAdError('Failed to display advertisement');
        }
      }
    };

    loadAdsenseScript();

    return () => {
      mounted = false;
      if (adScript && adScript.parentNode) {
        adScript.parentNode.removeChild(adScript);
      }
    };
  }, [publisherId, isClient]);

  if (!isClient || adError) {
    return <div className="min-h-[100px] bg-transparent" />;
  }

  return (
    <div className="w-full overflow-hidden my-4">
      <ins
        ref={adRef}
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