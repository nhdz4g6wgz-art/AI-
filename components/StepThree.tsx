import React, { useEffect } from 'react';
import { LoadingState } from '../types';

interface StepThreeProps {
  onBack: () => void;
  onRestart: () => void;
  onGenerate: () => void;
  status: LoadingState;
  resultImg?: string | null;
}

const StepThree: React.FC<StepThreeProps> = ({ 
  onBack, 
  onRestart, 
  onGenerate, 
  status, 
  resultImg 
}) => {
  
  // Auto-trigger generation on mount if idle
  useEffect(() => {
    if (status === 'idle') {
        onGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-full animate-fade-in items-center px-4">
       
       <div className="w-full flex justify-between items-center mb-6">
           <button onClick={onBack} className={`text-gray-500 hover:text-black ${status === 'loading' ? 'invisible' : ''}`}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
           </button>
           <h2 className="text-xl font-bold">试穿结果</h2>
           <div className="w-6"></div> {/* Spacer */}
       </div>

       <div className="flex-1 w-full max-w-md flex flex-col items-center justify-center mb-8">
           
           {status === 'loading' && (
               <div className="text-center space-y-4">
                   <div className="relative w-24 h-24 mx-auto">
                       <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                       <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
                   </div>
                   <p className="text-gray-600 font-medium animate-pulse">正在施展魔法...</p>
                   <p className="text-xs text-gray-400">Nano Banana 正在合成图像</p>
               </div>
           )}

           {status === 'error' && (
               <div className="text-center space-y-4">
                   <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                   </div>
                   <p className="text-gray-800 font-medium">出错了</p>
                   <button 
                     onClick={onGenerate}
                     className="px-6 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800"
                   >
                       重试
                   </button>
               </div>
           )}

           {status === 'success' && resultImg && (
               <div className="w-full space-y-6">
                   <div className="w-full bg-white p-2 rounded-2xl shadow-xl transform transition-all hover:scale-[1.02]">
                        <img src={resultImg} alt="Result" className="w-full rounded-xl" />
                   </div>
                   
                   <div className="flex gap-4 justify-center">
                        <a 
                          href={resultImg} 
                          download={`nano-style-tryon-${Date.now()}.png`}
                          className="flex-1 py-3 bg-gray-100 text-gray-900 rounded-xl font-medium flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            下载
                        </a>
                        <button 
                          onClick={onRestart}
                          className="flex-1 py-3 bg-black text-white rounded-xl font-medium shadow-lg hover:bg-gray-800 transition-colors"
                        >
                            再试一次
                        </button>
                   </div>
               </div>
           )}

       </div>
    </div>
  );
};

export default StepThree;
