import React from 'react';
import { HistoryItem } from '../types';

interface GalleryProps {
  items: HistoryItem[];
}

const Gallery: React.FC<GalleryProps> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <div className="w-full border-t border-gray-100 bg-white/80 backdrop-blur-md pb-6 pt-4 px-4 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
       <h3 className="text-sm font-semibold text-gray-500 mb-3 px-1">历史记录</h3>
       <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
         {items.map((item) => (
             <div key={item.id} className="flex-shrink-0 w-20 flex flex-col space-y-1 group cursor-pointer">
                 <div className="w-20 h-24 rounded-lg overflow-hidden relative shadow-sm border border-gray-100">
                    <img src={item.resultImage} alt="History" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                 </div>
                 <span className="text-[10px] text-gray-400 text-center">
                    {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 </span>
             </div>
         ))}
       </div>
    </div>
  );
};

export default Gallery;
