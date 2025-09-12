import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";

import { VoiceNarrator } from "@/core/audio/narration";

interface VoiceNarrationContextType {
  isNarrationEnabled: boolean;
  isPlaying: boolean;
  currentText: string;
  rate: number;
  voice: string;
  toggleNarration: () => void;
  speakText: (text: string, options?: { interrupt?: boolean }) => void;
  pauseCurrentNarration: () => void;
  stopCurrentNarration: () => void;
  setRate: (rate: number) => void;
  setVoice: (voice: string) => void;
  getAvailableVoices: () => SpeechSynthesisVoice[];
}

const VoiceNarrationContext = createContext<
  VoiceNarrationContextType | undefined
>(undefined);

export function useVoiceNarration() {
  const context = useContext(VoiceNarrationContext);
  if (!context) {
    throw new Error(
      "useVoiceNarration must be used within a VoiceNarrationProvider"
    );
  }
  return context;
}

interface VoiceNarrationProviderProps {
  children: React.ReactNode;
}

export function VoiceNarrationProvider({
  children,
}: VoiceNarrationProviderProps) {
  const [isNarrationEnabled, setIsNarrationEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [rate, setRateState] = useState(1);
  const [voice, setVoiceState] = useState("");
  const narratorRef = useRef<VoiceNarrator | null>(null);

  // Initialize narrator
  useEffect(() => {
    narratorRef.current = new VoiceNarrator({
      rate,
      volume: 0.8,
      pitch: 1.0,
      language: "en-US",
    });

    return () => {
      if (narratorRef.current) {
        narratorRef.current.stop();
      }
    };
  }, [rate]);

  const toggleNarration = useCallback(() => {
    setIsNarrationEnabled((prev) => {
      const newValue = !prev;
      if (!newValue && narratorRef.current) {
        narratorRef.current.stop();
        setIsPlaying(false);
        setCurrentText("");
      }
      return newValue;
    });
  }, []);

  const speakText = useCallback(
    (text: string, options: { interrupt?: boolean } = {}) => {
      if (!isNarrationEnabled || !narratorRef.current) return;

      if (options.interrupt) {
        narratorRef.current.stop();
        setIsPlaying(false);
      }

      setCurrentText(text);
      setIsPlaying(true);

      narratorRef.current
        .speak(text)
        .then(() => {
          setIsPlaying(false);
          setCurrentText("");
        })
        .catch(() => {
          setIsPlaying(false);
          setCurrentText("");
        });
    },
    [isNarrationEnabled]
  );

  const pauseCurrentNarration = useCallback(() => {
    if (narratorRef.current) {
      narratorRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const stopCurrentNarration = useCallback(() => {
    if (narratorRef.current) {
      narratorRef.current.stop();
      setIsPlaying(false);
      setCurrentText("");
    }
  }, []);

  const setRate = useCallback((newRate: number) => {
    setRateState(newRate);
    if (narratorRef.current) {
      narratorRef.current.updateSettings({ rate: newRate });
    }
  }, []);

  const setVoice = useCallback((newVoice: string) => {
    setVoiceState(newVoice);
    const voices = speechSynthesis.getVoices();
    const selectedVoice = voices.find((v) => v.name === newVoice);
    if (selectedVoice && narratorRef.current) {
      narratorRef.current.updateSettings({ voice: selectedVoice });
    }
  }, []);

  const getAvailableVoices = useCallback(() => {
    return speechSynthesis.getVoices();
  }, []);

  const value: VoiceNarrationContextType = {
    isNarrationEnabled,
    isPlaying,
    currentText,
    rate,
    voice,
    toggleNarration,
    speakText,
    pauseCurrentNarration,
    stopCurrentNarration,
    setRate,
    setVoice,
    getAvailableVoices,
  };

  return (
    <VoiceNarrationContext.Provider value={value}>
      {children}
    </VoiceNarrationContext.Provider>
  );
}
