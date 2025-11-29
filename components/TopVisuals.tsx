import React from 'react';
import { AppStep, ImageAsset } from '../types';

interface TopVisualsProps {
  step: AppStep;
  personImg?: ImageAsset | null;
  clothImg?: ImageAsset | null;
  resultImg?: string | null;
}

const TopVisuals: React.FC<TopVisualsProps> = ({ step, personImg, clothImg, resultImg }) => {
  
  const getCardStyle = (isActive: boolean, index: number) => {
    const baseStyle = "w-28 h-40 md:w-40 md:h-56 rounded-2xl shadow-xl transition-all duration-500 ease-out border-4 border-white object-cover bg-gray-200 flex items-center justify-center text-gray-400 overflow-hidden relative";
    
    // Tilt logic
    let transform = '';
    let zIndex = 10;
    let opacity = 'opacity-50 blur-sm grayscale';

    if (isActive) {
        opacity = 'opacity-100 blur-0 grayscale-0 scale-110';
        zIndex = 20;
        transform = 'rotate-0 translate-y-2';
    } else {
        if (index === 0) transform = '-rotate-6 -translate-x-4'; // Left card
        if (index === 1) transform = 'rotate-0'; // Middle card (inactive)
        if (index === 2) transform = 'rotate-6 translate-x-4'; // Right card
    }

    // Special override: If we are at step 2, show Step 1 card clearly but smaller? 
    // The requirement says "Slightly tilted cards... Step 2 selection shows Step 1 choice above".
    // Let's make the "Active" step center and large, others faded/tilted.
    
    // Adjusted logic for specific steps to match the "Visual Story"
    if (step === AppStep.SELECT_PERSON) {
        if (index === 0) { opacity = 'opacity-100'; transform = '-rotate-3 scale-105'; zIndex = 30; }
        if (index === 1) { opacity = 'opacity-40'; transform = 'rotate-3 translate-x-8 translate-y-4'; }
        if (index === 2) { opacity = 'opacity-20'; transform = 'rotate-6 translate-x-16 translate-y-8'; }
    } else if (step === AppStep.SELECT_CLOTHES) {
        if (index === 0) { opacity = 'opacity-80'; transform = '-rotate-6 -translate-x-12 scale-90'; zIndex = 20; }
        if (index === 1) { opacity = 'opacity-100'; transform = 'rotate-2 scale-105'; zIndex = 30; }
        if (index === 2) { opacity = 'opacity-40'; transform = 'rotate-6 translate-x-12 translate-y-4'; }
    } else {
        if (index === 0) { opacity = 'opacity-60'; transform = '-rotate-12 -translate-x-20 scale-75'; zIndex = 10; }
        if (index === 1) { opacity = 'opacity-80'; transform = '-rotate-6 -translate-x-8 scale-90'; zIndex = 20; }
        if (index === 2) { opacity = 'opacity-100'; transform = 'rotate-0 scale-110'; zIndex = 30; }
    }

    return `${baseStyle} ${opacity} ${transform} z-[${zIndex}]`;
  };

  return (
    <div className="relative w-full h-64 md:h-80 flex justify-center items-center mt-4 mb-8 perspective-1000">
      {/* Card 1: Person */}
      <div className={getCardStyle(false, 0)} style={{ position: 'absolute' }}>
        {personImg ? (
          <img src={personImg.url} alt="Person" className="w-full h-full object-cover" />
        ) : (
          <div className="text-xs md:text-sm font-bold">1. 选人</div>
        )}
        <div className="absolute top-2 left-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-xs">1</div>
      </div>

      {/* Card 2: Cloth */}
      <div className={getCardStyle(false, 1)} style={{ position: 'absolute' }}>
        {clothImg ? (
            <img src={clothImg.url} alt="Cloth" className="w-full h-full object-cover" />
        ) : (
            <div className="text-xs md:text-sm font-bold">2. 选衣</div>
        )}
        <div className="absolute top-2 left-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-xs">2</div>
      </div>

      {/* Card 3: Result */}
      <div className={getCardStyle(false, 2)} style={{ position: 'absolute' }}>
        {resultImg ? (
             <img src={resultImg} alt="Result" className="w-full h-full object-cover" />
        ) : (
            <div className="text-xs md:text-sm font-bold">3. 试穿</div>
        )}
        <div className="absolute top-2 left-2 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">3</div>
      </div>
    </div>
  );
};

export default TopVisuals;
