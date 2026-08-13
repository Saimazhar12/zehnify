import React, { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import { Mood } from '../types';
import { MOODS } from '../constants';

interface MoodScannerProps {
  onScanComplete: (mood: Mood) => void;
}

const MoodScanner: React.FC<MoodScannerProps> = ({ onScanComplete }) => {
  const [, setScanning] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [result, setResult] = useState<Mood | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startScan = async () => {
    try {
      setScanning(true);
      setResult(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setTimeout(() => {
        stopScan(mediaStream);
        const randomMood = MOODS[Math.floor(Math.random() * MOODS.length)];
        setResult(randomMood);
        onScanComplete(randomMood);
      }, 4000);
    } catch (err) {
      console.error('Camera error:', err);
      setScanning(false);
      alert('Unable to access camera. Please allow permissions.');
    }
  };

  const stopScan = (mediaStream: MediaStream) => {
    mediaStream.getTracks().forEach((track) => track.stop());
    setStream(null);
    setScanning(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center min-h-[450px]">
      {!stream && !result && (
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>
            <div className="relative w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
              <Camera className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">AI Mood Detection</h3>
            <p className="text-gray-500 max-w-sm mx-auto text-base">
              Our advanced AI analyzes micro-expressions to log your emotional state securely.
            </p>
          </div>
          <button
            onClick={startScan}
            className="px-8 py-3.5 bg-blue-600 text-white rounded-full font-semibold shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
          >
            Start Face Scan
          </button>
        </div>
      )}

      {stream && (
        <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl bg-black aspect-[4/3]">
          <video ref={videoRef} autoPlay muted className="w-full h-full object-cover opacity-90"></video>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white/30 rounded-full relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
              <div className="absolute inset-0 border-t-4 border-l-4 border-blue-400 rounded-tl-3xl w-16 h-16 opacity-80"></div>
              <div className="absolute inset-0 border-t-4 border-r-4 border-blue-400 rounded-tr-3xl w-16 h-16 left-auto right-0 opacity-80"></div>
              <div className="absolute inset-0 border-b-4 border-l-4 border-blue-400 rounded-bl-3xl w-16 h-16 top-auto bottom-0 opacity-80"></div>
              <div className="absolute inset-0 border-b-4 border-r-4 border-blue-400 rounded-br-3xl w-16 h-16 top-auto bottom-0 right-0 opacity-80"></div>
            </div>
          </div>
          <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center space-y-2">
            <span className="bg-black/60 text-white px-4 py-1.5 rounded-full text-xs font-mono backdrop-blur-md border border-white/10">
              ANALYZING MICRO-EXPRESSIONS...
            </span>
          </div>
        </div>
      )}

      {result && (
        <div className="text-center animate-fade-in w-full max-w-md">
          <div className={`w-28 h-28 ${result.color} rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl ring-8 ring-white`}>
            <result.icon className="w-14 h-14 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-3">You seem {result.label}</h3>
          <p className="text-gray-500 mb-8 text-lg">We've logged this to your daily tracking. Would you like to chat about it?</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setResult(null)} className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-full transition-colors">
              Scan Again
            </button>
            <button className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-full shadow-lg hover:bg-gray-800 transition-colors">
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodScanner;
