import React, { useRef } from 'react';
import { ImageAsset } from '../types';
import { PRESET_PERSONS } from '../constants';
import { fileToBase64 } from '../utils';

interface StepOneProps {
  selectedId?: string;
  onSelect: (asset: ImageAsset) => void;
  onNext: () => void;
}

const StepOne: React.FC<StepOneProps> = ({ selectedId, onSelect, onNext }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);
      const newAsset: ImageAsset = {
        id: `upload-${Date.now()}`,
        url: base64, // Use base64 as URL for local preview
        base64: base64
      };
      onSelect(newAsset);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex justify-between items-center mb-4 px-4">
        <h2 className="text-xl font-bold text-gray-800">选择模特</h2>
        <button 
          onClick={onNext}
          disabled={!selectedId}
          className={`px-6 py-2 rounded-full font-medium transition-colors ${
            selectedId 
              ? 'bg-black text-white hover:bg-gray-800' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          下一步
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20 no-scrollbar">
        <div className="grid grid-cols-3 gap-4">
          {/* Upload Button */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs text-gray-500 font-medium">上传照片</span>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload}
            />
          </div>

          {/* Presets */}
          {PRESET_PERSONS.map((p) => (
            <div 
              key={p.id}
              onClick={() => onSelect(p)}
              className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer transition-all ${
                selectedId === p.id 
                  ? 'ring-4 ring-black ring-offset-2 scale-95' 
                  : 'hover:opacity-90'
              }`}
            >
              <img src={p.url} alt="Model" className="w-full h-full object-cover" />
              {selectedId === p.id && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepOne;
