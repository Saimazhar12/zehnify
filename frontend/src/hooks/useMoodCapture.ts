import { useState, useEffect, useRef } from 'react';
import { moodService } from '../services/moodService';

const CAPTURE_INTERVAL_MS = 3000;
const COOLDOWN_INTERVAL_MS = 20000;
const SNAPSHOT_WIDTH = 480;
const JPEG_QUALITY = 0.8;

export type MoodCaptureStatus =
  | 'idle'
  | 'scanning'
  | 'detected'
  | 'no_face'
  | 'capped'
  | 'cooldown';

interface UseMoodCaptureOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  chatId?: string | null;
  enabled?: boolean;
}

function captureFrame(video: HTMLVideoElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (!video.videoWidth || !video.videoHeight) {
      resolve(null);
      return;
    }

    const scale = SNAPSHOT_WIDTH / video.videoWidth;
    const width = SNAPSHOT_WIDTH;
    const height = Math.round(video.videoHeight * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(null);
      return;
    }

    ctx.drawImage(video, 0, 0, width, height);
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', JPEG_QUALITY);
  });
}

export function useMoodCapture({ videoRef, chatId, enabled = false }: UseMoodCaptureOptions) {
  const [detectedMood, setDetectedMood] = useState('Scanning...');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [scansUsed, setScansUsed] = useState(0);
  const [scansLimit, setScansLimit] = useState(50);
  const [status, setStatus] = useState<MoodCaptureStatus>('idle');
  const inFlightRef = useRef(false);
  const scansUsedRef = useRef(0);
  const scansLimitRef = useRef(50);
  const enabledRef = useRef(enabled);
  const chatIdRef = useRef(chatId);

  enabledRef.current = enabled;
  chatIdRef.current = chatId;

  useEffect(() => {
    if (!enabled || !chatId) {
      setStatus('idle');
      setDetectedMood('Scanning...');
      setConfidence(null);
      return;
    }

    scansUsedRef.current = 0;
    scansLimitRef.current = 50;
    setScansUsed(0);
    setScansLimit(50);
    setDetectedMood('Scanning...');
    setConfidence(null);
    setStatus('idle');

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const schedule = (delayMs: number) => {
      if (cancelled) return;
      timer = setTimeout(() => {
        void tick();
      }, delayMs);
    };

    const tick = async () => {
      if (cancelled || !enabledRef.current || !chatIdRef.current) return;
      if (inFlightRef.current) {
        schedule(COOLDOWN_INTERVAL_MS);
        return;
      }

      const activeChatId = chatIdRef.current;
      const video = videoRef.current;

      if (scansUsedRef.current >= scansLimitRef.current) {
        setStatus('capped');
        setDetectedMood('Scan limit reached');
        return;
      }

      if (!video) {
        schedule(CAPTURE_INTERVAL_MS);
        return;
      }

      const blob = await captureFrame(video);
      if (!blob) {
        schedule(CAPTURE_INTERVAL_MS);
        return;
      }

      inFlightRef.current = true;
      setStatus('scanning');

      let nextDelay = CAPTURE_INTERVAL_MS;

      try {
        const result = await moodService.analyzeFrame(activeChatId, blob);
        scansUsedRef.current = result.scansUsed;
        scansLimitRef.current = result.scansLimit;
        setScansUsed(result.scansUsed);
        setScansLimit(result.scansLimit);

        if (result.cooldown) {
          setStatus('cooldown');
          setDetectedMood('Scanner paused');
          nextDelay = result.retryAfterMs ?? COOLDOWN_INTERVAL_MS;
        } else if (result.capped) {
          setStatus('capped');
          setDetectedMood('Scan limit reached');
          return;
        } else if (result.snapshot?.accepted) {
          setDetectedMood('Active');
          setConfidence(null);
          setStatus('detected');
          nextDelay = CAPTURE_INTERVAL_MS;
        } else {
          setDetectedMood('No face');
          setStatus('no_face');
          nextDelay = CAPTURE_INTERVAL_MS;
        }
      } catch (error) {
        console.error('Mood capture failed:', error);
        setStatus('cooldown');
        setDetectedMood('Scanner paused');
        nextDelay = COOLDOWN_INTERVAL_MS;
      } finally {
        inFlightRef.current = false;
        if (!cancelled) {
          schedule(nextDelay);
        }
      }
    };

    schedule(0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      inFlightRef.current = false;
    };
  }, [chatId, enabled, videoRef]);

  return {
    detectedMood,
    confidence,
    scansUsed,
    scansLimit,
    status,
  };
}
