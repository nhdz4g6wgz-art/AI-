import React, { useState, useCallback } from 'react';
import { AppStep, ImageAsset, LoadingState, HistoryItem } from './types';
import { generateTryOn } from './services/geminiService';
import { urlToBase64 } from './utils';
import TopVisuals from './components/TopVisuals';
import StepOne from './components/StepOne';
import StepTwo from './components/StepTwo';
import StepThree from './components/StepThree';
import Gallery from './components/Gallery';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.SELECT_PERSON);
  
  // Selection State
  const [selectedPerson, setSelectedPerson] = useState<ImageAsset | null>(null);
  const [selectedCloth, setSelectedCloth] = useState<ImageAsset | null>(null);
  
  // Custom Assets (Uploaded/Generated)
  const [customClothes, setCustomClothes] = useState<ImageAsset[]>([]);
  
  // Result State
  const [resultImg, setResultImg] = useState<string | null>(null);
  const [genStatus, setGenStatus] = useState<LoadingState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // History
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleNextStep = () => {
    if (step === AppStep.SELECT_PERSON && selectedPerson) {
      setStep(AppStep.SELECT_CLOTHES);
    } else if (step === AppStep.SELECT_CLOTHES && selectedCloth) {
      setStep(AppStep.GENERATE_RESULT);
    }
  };

  const handleBackStep = () => {
    if (step === AppStep.SELECT_CLOTHES) {
      setStep(AppStep.SELECT_PERSON);
    } else if (step === AppStep.GENERATE_RESULT) {
      setStep(AppStep.SELECT_CLOTHES);
      setGenStatus('idle'); // Reset status if backing out of result
      setErrorMessage('');
    }
  };

  const handleRestart = () => {
    setStep(AppStep.SELECT_PERSON);
    setSelectedPerson(null);
    setSelectedCloth(null);
    setResultImg(null);
    setGenStatus('idle');
    setErrorMessage('');
  };

  const executeTryOn = useCallback(async () => {
    if (!selectedPerson || !selectedCloth) return;

    setGenStatus('loading');
    setErrorMessage('');
    
    try {
      // Ensure we have base64 for both
      let personB64 = selectedPerson.base64;
      if (!personB64) {
         // It's a preset URL, fetch it
         personB64 = await urlToBase64(selectedPerson.url);
      }

      let clothB64 = selectedCloth.base64;
      if (!clothB64) {
          clothB64 = await urlToBase64(selectedCloth.url);
      }

      const result = await generateTryOn(personB64, clothB64);
      setResultImg(result);
      setGenStatus('success');

      // Add to history
      const newItem: HistoryItem = {
          id: Date.now().toString(),
          personImage: selectedPerson.url,
          clothImage: selectedCloth.url,
          resultImage: result,
          timestamp: Date.now()
      };
      setHistory(prev => [newItem, ...prev]);

    } catch (error: any) {
      console.error("Try On Error:", error);
      setGenStatus('error');
      setErrorMessage(error.message || "生成失败，请稍后重试。");
    }
  }, [selectedPerson, selectedCloth]);

  return (
    <div className="max-w-md mx-auto h-screen bg-gray-50 flex flex-col relative overflow-hidden shadow-2xl md:my-8 md:h-[90vh] md:rounded-[40px]">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-100/50 to-transparent pointer-events-none" />
      
      {/* Top Visual Area */}
      <TopVisuals 
        step={step} 
        personImg={selectedPerson} 
        clothImg={selectedCloth} 
        resultImg={resultImg} 
      />

      {/* Main Interaction Area */}
      <div className="flex-1 w-full bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative z-30 flex flex-col overflow-hidden">
        
        {/* Step Indicator */}
        <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>

        <div className="flex-1 overflow-hidden relative">
            {step === AppStep.SELECT_PERSON && (
                <StepOne 
                    selectedId={selectedPerson?.id}
                    onSelect={setSelectedPerson}
                    onNext={handleNextStep}
                />
            )}
            
            {step === AppStep.SELECT_CLOTHES && (
                <StepTwo 
                    selectedId={selectedCloth?.id}
                    onSelect={setSelectedCloth}
                    onNext={handleNextStep}
                    onBack={handleBackStep}
                    customClothes={customClothes}
                    addCustomCloth={(c) => setCustomClothes([...customClothes, c])}
                />
            )}

            {step === AppStep.GENERATE_RESULT && (
                <StepThree 
                    onBack={handleBackStep}
                    onRestart={handleRestart}
                    onGenerate={executeTryOn}
                    status={genStatus}
                    errorMessage={errorMessage}
                    resultImg={resultImg}
                />
            )}
        </div>

        {/* Gallery Footer (Only show on selection steps for quick access, or always?) */}
        {step !== AppStep.GENERATE_RESULT && (
            <Gallery items={history} />
        )}
      </div>
    </div>
  );
};

export default App;