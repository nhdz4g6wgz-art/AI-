import React, { useRef, useState } from 'react';
import { ImageAsset, LoadingState } from '../types';
import { PRESET_CLOTHES } from '../constants';
import { fileToBase64 } from '../utils';
import { generateClothes } from '../services/geminiService';

interface StepTwoProps {
  selectedId?: string;
  onSelect: (asset: ImageAsset) => void;
  onNext: () => void;
  onBack: () => void;
  customClothes: ImageAsset[];
  addCustomCloth: (asset: ImageAsset) => void;
}

const StepTwo: React.FC<StepTwoProps> = ({ 
  selectedId, 
  onSelect, 
  onNext, 
  onBack, 
  customClothes, 
  addCustomCloth 
}) => {
  const [mode, setMode] = useState<'select' | 'generate'>('select');
  const [prompt, setPrompt] = useState('');
  const [genState, setGenState] = useState<LoadingState>('idle');
  const [genError, setGenError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);
      const newAsset: ImageAsset = {
        id: `upload-cloth-${Date.now()}`,
        url: base64,
        base64: base64
      };
      addCustomCloth(newAsset);
      onSelect(newAsset);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenState('loading');
    setGenError('');
    try {
      const base64 = await generateClothes(prompt);
      const newAsset: ImageAsset = {
        id: `gen-cloth-${Date.now()}`,
        url: base64,
        base64: base64,
        isGenerated: true
      };
      addCustomCloth(newAsset);
      onSelect(newAsset);
      setGenState('success');
      setMode('select'); // Switch back to view selection
    } catch (error: any) {
      console.error(error);
      setGenState('error');
      setGenError(error.message || "生成失败");
    }
  };

  const combinedClothes = [...customClothes, ...PRESET_CLOTHES];

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header / Nav */}
      <div className="flex justify-between items-center mb-4 px-4">
        <button onClick={onBack} className="text-gray-500 hover:text-black">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        </button>
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
           <button 
             onClick={() => setMode('select')}
             className={`px-4 py-1.5 text-sm rounded-md transition-all ${mode === 'select' ? 'bg-white shadow-sm font-medium text-black' : 'text-gray-500'}`}
           >
             选择
           </button>
           <button 
             onClick={() => setMode('generate')}
             className={`px-4 py-1.5 text-sm rounded-md transition-all ${mode === 'generate' ? 'bg-white shadow-sm font-medium text-black' : 'text-gray-500'}`}
           >
             生成
           </button>
        </div>
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 no-scrollbar">
        {mode === 'select' ? (
          <div className="grid grid-cols-3 gap-4">
             {/* Upload Button */}
             <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 hover:bg-gray-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs text-gray-500 font-medium">上传衣服</span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                />
              </div>

              {combinedClothes.map((c) => (
                <div 
                  key={c.id}
                  onClick={() => onSelect(c)}
                  className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer transition-all bg-white ${
                    selectedId === c.id 
                      ? 'ring-4 ring-black ring-offset-2 scale-95' 
                      : 'hover:opacity-90 shadow-sm'
                  }`}
                >
                  <img src={c.url} alt="Cloth" className="w-full h-full object-contain p-2" />
                  {c.isGenerated && (
                      <div className="absolute top-1 right-1 bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">AI</div>
                  )}
                  {selectedId === c.id && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center pt-8">
            <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">描述你想生成的衣服</label>
                <textarea 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none bg-gray-50 text-sm"
                  rows={4}
                  placeholder="例如：一件红色的复古连衣裙，带有蕾丝花边..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                
                <button 
                  onClick={handleGenerate}
                  disabled={genState === 'loading' || !prompt.trim()}
                  className={`w-full mt-4 py-3 rounded-xl flex items-center justify-center font-medium transition-all ${
                    genState === 'loading' || !prompt.trim()
                     ? 'bg-gray-100 text-gray-400'
                     : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200 hover:shadow-xl'
                  }`}
                >
                  {genState === 'loading' ? (
                     <>
                       <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        生成中...
                     </>
                  ) : '开始生成'}
                </button>
                
                {genState === 'error' && (
                  <p className="text-red-500 text-xs mt-2 text-center break-words">{genError || "生成失败，请重试。"}</p>
                )}
            </div>
            
            <p className="mt-8 text-xs text-gray-400 max-w-xs text-center">
                使用 Nano Banana (gemini-2.5-flash-image) 模型生成独一无二的服装设计。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepTwo;