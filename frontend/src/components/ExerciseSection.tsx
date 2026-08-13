import React, { useState } from 'react';
import { ArrowLeft, X, Dumbbell, Play, Pause, Info } from 'lucide-react';
import { Exercise } from '../types';
import { EXERCISES } from '../constants';
import { useExerciseTimer } from '../hooks/useExerciseTimer';

const ExerciseSection: React.FC = () => {
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const { timeLeft, isPlaying, setTimeLeft, setIsPlaying, toggleTimer, formatTime } = useExerciseTimer();

  const handleCardClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  const startExercise = () => {
    if (!selectedExercise) return;
    setActiveExercise(selectedExercise);
    setSelectedExercise(null);
    const minutes = parseInt(selectedExercise.duration.split(' ')[0]);
    setTimeLeft(minutes * 60);
    setIsPlaying(true);
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      {/* Exercise Info Popup */}
      {selectedExercise && !activeExercise && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-white/90 backdrop-blur-sm rounded-[2rem] transition-all animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 max-w-md w-full relative">
            <button onClick={() => setSelectedExercise(null)} className="absolute top-4 right-4 min-w-11 min-h-11 flex items-center justify-center text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gray-50 text-blue-600">
              <Dumbbell className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedExercise.title}</h3>
            <div className="flex items-center space-x-2 text-gray-500 text-sm mb-4">
              <span className={`px-2 py-0.5 rounded-md ${selectedExercise.color} text-xs font-bold`}>{selectedExercise.duration}</span>
              <span>•</span>
              <span>Guided Session</span>
            </div>
            <p className="text-gray-600 leading-relaxed mb-8 text-sm">{selectedExercise.description}</p>
            <div className="flex space-x-3">
              <button onClick={() => setSelectedExercise(null)} className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={startExercise}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5"
              >
                Start Now
              </button>
            </div>
          </div>
        </div>
      )}

      {activeExercise ? (
        <div className="flex-1 flex flex-col animate-fade-in">
          <button
            onClick={() => { setActiveExercise(null); setIsPlaying(false); }}
            className="flex items-center text-gray-500 hover:text-gray-800 mb-6 w-fit transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Exercises
          </button>
          <div className="flex-1 bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-12 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <div className={`w-96 h-96 rounded-full ${activeExercise.color.split(' ')[0]} animate-pulse`}></div>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold mb-6 ${activeExercise.color}`}>
              {activeExercise.duration} Session
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">{activeExercise.title}</h2>
            <p className="text-gray-500 text-lg mb-12 text-center max-w-md">Focus on your movement. Breathe deeply and rhythmically.</p>
            <div className="text-5xl sm:text-7xl md:text-8xl font-mono font-bold text-gray-800 mb-12 tracking-tight">
              {formatTime(timeLeft)}
            </div>
            <div className="flex items-center space-x-8">
              <button
                onClick={() => {
                  setIsPlaying(false);
                  const minutes = parseInt(activeExercise.duration.split(' ')[0]);
                  setTimeLeft(minutes * 60);
                }}
                className="p-4 rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
                title="Reset Timer"
              >
                <span className="font-bold text-sm">RESET</span>
              </button>
              <button
                onClick={toggleTimer}
                className="w-24 h-24 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
              >
                {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
              </button>
              <button className="p-4 opacity-0 pointer-events-none">
                <span className="font-bold text-sm">RESET</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-5 sm:p-8 text-white shadow-lg">
            <h2 className="text-3xl font-bold mb-2">Mindful Movement</h2>
            <p className="opacity-90">Physical activity is a proven way to reduce stress. Select a session below.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {EXERCISES.map((ex) => (
              <div
                key={ex.id}
                onClick={() => handleCardClick(ex)}
                className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${ex.color}`}>{ex.duration}</span>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Info className="w-4 h-4 ml-0.5" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{ex.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{ex.description}</p>
                <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="w-0 group-hover:w-full h-full bg-blue-500 transition-all duration-700 ease-out"></div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ExerciseSection;
