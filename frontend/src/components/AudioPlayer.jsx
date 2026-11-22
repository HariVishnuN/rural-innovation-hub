import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

/**
 * Audio Walkthrough Player using browser native SpeechSynthesis
 * Reads out step-by-step assembly guides with play/pause and stop controls.
 */
const AudioPlayer = ({ steps, currentStep = 0 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(currentStep);

  const speak = (text) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device/browser.');
      return;
    }

    window.speechSynthesis.cancel();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for clarity in noisy rural workshops
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handlePlayCurrent = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const step = steps[activeStepIndex];
      const speechText = step.audio_text || `${step.title}. ${step.details}`;
      speak(`Step ${activeStepIndex + 1}: ${speechText}`);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-50 border border-teal-100 text-teal-900">
      <button
        onClick={handlePlayCurrent}
        className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 transition-colors shadow-sm"
        title={isPlaying ? 'Pause audio guide' : 'Play voice assembly guide'}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>

      <div className="text-xs">
        <span className="font-semibold block">Spoken Assembly Walkthrough</span>
        <span className="text-teal-700">Step {activeStepIndex + 1} of {steps.length}</span>
      </div>

      <div className="ml-auto flex items-center gap-1">
        {steps.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActiveStepIndex(idx);
              const step = steps[idx];
              speak(`Step ${idx + 1}: ${step.audio_text || step.details}`);
            }}
            className={`w-6 h-6 rounded text-xs font-bold transition-all ${
              activeStepIndex === idx
                ? 'bg-teal-600 text-white'
                : 'bg-white text-teal-800 border border-teal-200 hover:bg-teal-100'
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AudioPlayer;
