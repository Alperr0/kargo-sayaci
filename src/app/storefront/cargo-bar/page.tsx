'use client';

import React, { useEffect, useState } from 'react';

// International standard corporate interface for store settings
interface CargoBarData {
  isActive: boolean;
  freeShippingLimit: number;
  barMessage: string;
  successMessage: string;
  bgColor: string;
  textColor: string;
  progressColor: string;
  barSkin: string;
}

export default function StorefrontCargoBar() {
  // Client-side states for cart and database settings
  const [settings, setSettings] = useState<CargoBarData | null>(null);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load database settings and listen to dynamic ikas cart changes
  useEffect(() => {
    // 1. Fetch store customizations from our database API
    const fetchSettings = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const storeId = queryParams.get('id') || 'dev-store-placeholder'; 

        const response = await fetch(`/api/cargo-bar?authorizedAppId=${storeId}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setSettings(result.data);
        }
      } catch (error) {
        console.error('Error loading storefront bar settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();

    // 2. Dynamic ikas cart session synchronization
    const handleCartUpdate = (event: any) => {
      if (event?.detail?.cart?.totalPrice) {
        // Convert to standard currency units if ikas returns cents
        const total = event.detail.cart.totalPrice / 100;
        setCartTotal(total);
      }
    };

    // Global listener for ikas storefront cart state changes
    window.addEventListener('ikas:cart:update' as any, handleCartUpdate);

    // Clean up event listener when storefront unmounts to prevent memory leaks
    return () => {
      window.removeEventListener('ikas:cart:update' as any, handleCartUpdate);
    };
  }, []);

  // If data is loading or app is turned off by merchant, render nothing
  if (isLoading || !settings || !settings.isActive) {
    return null;
  }

  // Marketing math calculations
  const remainingAmount = settings.freeShippingLimit - cartTotal;
  const isFreeShippingAchieved = remainingAmount <= 0;
  
  // Progress bar percentage calculation (bounded between 0% and 100%)
  const progressPercentage = Math.min((cartTotal / settings.freeShippingLimit) * 100, 100);

  // Dynamic bar message parsing
  const displayMessage = isFreeShippingAchieved
    ? settings.successMessage
    : settings.barMessage.replace('{kalan}', remainingAmount.toFixed(2));

  return (
    <div 
      style={{ backgroundColor: settings.bgColor, color: settings.textColor }} 
      className="w-full py-3 px-4 text-center font-bold text-sm shadow-md transition-all duration-300 relative z-[9999]"
    >
      {/* Embedded production-ready styles for textures */}
      <style>{`
        @keyframes storefront-move-stripes {
          0% { background-position: 0 0; }
          100% { background-position: 40px 0; }
        }
        .store-skin-striped {
          background-image: linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent);
          background-size: 40px 40px;
        }
        .store-skin-animated {
          background-image: linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent);
          background-size: 40px 40px;
          animation: storefront-move-stripes 1s linear infinite;
        }
        .store-skin-neon {
          box-shadow: 0 0 10px var(--store-neon), 0 0 3px var(--store-neon);
        }
      `}</style>

      {/* Dynamic Text Container */}
      <div className="mb-2 tracking-wide">
        {displayMessage}
      </div>

      {/* Dynamic Progress Track Layout */}
      <div className="max-w-xl mx-auto bg-black/20 rounded-full h-3 overflow-hidden shadow-inner relative">
        <div
          style={{ 
            width: `${progressPercentage}%`, 
            backgroundColor: settings.progressColor,
            ['--store-neon' as any]: settings.progressColor
          }}
          className={`h-full transition-all duration-500 rounded-full ${
            settings.barSkin === 'striped' ? 'store-skin-striped' : ''
          } ${
            settings.barSkin === 'animated' ? 'store-skin-animated' : ''
          } ${
            settings.barSkin === 'neon' ? 'store-skin-neon' : ''
          }`}
        ></div>
      </div>
    </div>
  );
}