import React, { useState, useEffect } from 'react';
import { OnboardingStep } from '../types/gamification';
import {
  getOnboardingSteps,
  getCurrentStep,
  completeOnboardingStep,
  isOnboardingComplete,
  skipOnboarding,
  getOnboardingProgress,
  loadOnboardingProgress
} from '../utils/onboardingLogic';

interface OnboardingTourProps {
  userId: string;
  onNavigate: (tab: any) => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ userId, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStep | null>(null);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadOnboardingProgress();
    const shouldShow = !isOnboardingComplete();
    setIsOpen(shouldShow);
    
    if (shouldShow) {
      setSteps(getOnboardingSteps());
      setCurrentStep(getCurrentStep());
      setProgress(getOnboardingProgress());
    }
  }, []);

  const handleNext = () => {
    if (currentStep) {
      completeOnboardingStep(currentStep.id);
      const nextStep = getCurrentStep();
      
      if (nextStep) {
        setCurrentStep(nextStep);
        setSteps(getOnboardingSteps());
        setProgress(getOnboardingProgress());
        
        if (nextStep.targetTab) {
          onNavigate(nextStep.targetTab);
        }
      } else {
        setIsOpen(false);
      }
    }
  };

  const handleSkip = () => {
    skipOnboarding();
    setIsOpen(false);
  };

  if (!isOpen || !currentStep) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Progresso do Tour</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🎯</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            {currentStep.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {currentStep.description}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center space-x-2 mb-6">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`w-3 h-3 rounded-full ${
                step.completed
                  ? 'bg-orange-500'
                  : step.id === currentStep.id
                  ? 'bg-orange-300'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            ></div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={handleSkip}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium transition"
          >
            Pular Tour
          </button>
          <button
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-lg font-medium transition"
          >
            {currentStep.order === steps.length ? 'Concluir' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
