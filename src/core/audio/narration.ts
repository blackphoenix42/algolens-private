/**
 * Voice-over narration system for AlgoLens
 * Provides audio descriptions and narration for accessibility
 */

interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
  voice?: SpeechSynthesisVoice;
  language: string;
}

interface NarrationScript {
  [key: string]: {
    intro: string;
    steps: string[];
    conclusion: string;
    explanations: Record<string, string>;
  };
}

export class VoiceNarrator {
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPlaying = false;
  private isPaused = false;
  private textQueue: string[] = [];
  private settings: VoiceSettings;
  private stateChangeCallback?: (playing: boolean, paused: boolean) => void;

  constructor(settings: Partial<VoiceSettings> = {}) {
    this.synth = window.speechSynthesis;
    this.settings = {
      rate: 0.8,
      pitch: 1.0,
      volume: 0.8,
      language: "en-US",
      ...settings,
    };

    // Initialize voice
    this.initializeVoice();
  }

  private async initializeVoice() {
    // Wait for voices to load
    if (this.synth.getVoices().length === 0) {
      await new Promise<void>((resolve) => {
        this.synth.onvoiceschanged = () => resolve();
      });
    }

    // Select best voice
    const voices = this.synth.getVoices();
    const preferredVoice =
      voices.find(
        (voice) =>
          voice.lang.startsWith(this.settings.language) &&
          voice.name.includes("Neural")
      ) ||
      voices.find((voice) => voice.lang.startsWith(this.settings.language)) ||
      voices[0];

    if (preferredVoice) {
      this.settings.voice = preferredVoice;
    }
  }

  // Speak text immediately
  speak(text: string, interrupt = false): Promise<void> {
    if (interrupt) {
      this.stop();
    }

    return new Promise((resolve, reject) => {
      if (!text.trim()) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);

      // Apply settings
      utterance.rate = this.settings.rate;
      utterance.pitch = this.settings.pitch;
      utterance.volume = this.settings.volume;
      utterance.lang = this.settings.language;

      if (this.settings.voice) {
        utterance.voice = this.settings.voice;
      }

      // Event handlers
      utterance.onstart = () => {
        this.isPlaying = true;
        this.isPaused = false;
        this.currentUtterance = utterance;
        this.stateChangeCallback?.(true, false);
      };

      utterance.onend = () => {
        this.isPlaying = false;
        this.isPaused = false;
        this.currentUtterance = null;
        this.stateChangeCallback?.(false, false);
        resolve();
      };

      utterance.onerror = (event) => {
        this.isPlaying = false;
        this.isPaused = false;
        this.currentUtterance = null;
        this.stateChangeCallback?.(false, false);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.synth.speak(utterance);
    });
  }

  // Queue text for speaking
  queue(text: string) {
    this.textQueue.push(text);
  }

  // Play queued text
  async playQueue(): Promise<void> {
    for (const text of this.textQueue) {
      await this.speak(text);
    }
    this.textQueue = [];
  }

  // Pause narration
  pause() {
    if (this.isPlaying && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      this.stateChangeCallback?.(true, true);
    }
  }

  // Resume narration
  resume() {
    if (this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.stateChangeCallback?.(true, false);
    }
  }

  // Stop narration
  stop() {
    this.synth.cancel();
    this.isPlaying = false;
    this.isPaused = false;
    this.currentUtterance = null;
    this.textQueue = [];
    this.stateChangeCallback?.(false, false);
  }

  // Update settings
  updateSettings(newSettings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }

  // Get available voices
  getVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices();
  }

  // Set state change callback
  onStateChange(callback: (playing: boolean, paused: boolean) => void) {
    this.stateChangeCallback = callback;
  }

  // Get current state
  getState() {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      queueLength: this.queue.length,
    };
  }
}

// Algorithm narration scripts
const NARRATION_SCRIPTS: NarrationScript = {
  "bubble-sort": {
    intro:
      "Welcome to Bubble Sort visualization. Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
    steps: [
      "Starting with the first element",
      "Comparing adjacent elements",
      "Swapping elements if they are out of order",
      "Moving to the next pair",
      "Completing one pass through the array",
      "Repeating until no swaps are needed",
    ],
    conclusion:
      "Bubble Sort is complete. The array is now sorted in ascending order.",
    explanations: {
      swap: "Swapping elements because the left element is greater than the right element",
      compare: "Comparing two adjacent elements",
      pass: "Completed one full pass through the array",
      sorted: "This element is now in its correct position",
    },
  },
  "quick-sort": {
    intro:
      "Welcome to Quick Sort visualization. Quick Sort is an efficient divide-and-conquer algorithm that picks a pivot element and partitions the array around it.",
    steps: [
      "Selecting a pivot element",
      "Partitioning the array around the pivot",
      "Moving smaller elements to the left",
      "Moving larger elements to the right",
      "Recursively sorting sub-arrays",
      "Combining the results",
    ],
    conclusion:
      "Quick Sort is complete. The array has been efficiently sorted.",
    explanations: {
      pivot: "This is the pivot element around which we partition",
      partition: "Partitioning the array into smaller and larger elements",
      recurse: "Recursively sorting the sub-arrays",
      combine: "Combining the sorted sub-arrays",
    },
  },
  "merge-sort": {
    intro:
      "Welcome to Merge Sort visualization. Merge Sort is a stable, divide-and-conquer algorithm that divides the array into halves and merges them back in sorted order.",
    steps: [
      "Dividing the array into two halves",
      "Recursively sorting each half",
      "Merging the sorted halves",
      "Comparing elements from both halves",
      "Placing smaller element first",
      "Continuing until all elements are merged",
    ],
    conclusion:
      "Merge Sort is complete. The array is now sorted with guaranteed O(n log n) performance.",
    explanations: {
      divide: "Dividing the array into smaller sub-arrays",
      merge: "Merging two sorted arrays into one",
      compare: "Comparing elements from both sub-arrays",
      stable:
        "Merge sort is stable - equal elements maintain their relative order",
    },
  },
};

// Algorithm narrator class
export class AlgorithmNarrator {
  private narrator: VoiceNarrator;
  private currentAlgorithm: string | null = null;
  private stepIndex = 0;
  private autoNarrate = false;

  constructor(settings?: Partial<VoiceSettings>) {
    this.narrator = new VoiceNarrator(settings);
  }

  // Start algorithm narration
  async startAlgorithm(algorithm: string, autoNarrate = false) {
    this.currentAlgorithm = algorithm;
    this.stepIndex = 0;
    this.autoNarrate = autoNarrate;

    const script = NARRATION_SCRIPTS[algorithm];
    if (!script) {
      await this.narrator.speak(
        `Starting ${algorithm.replace("-", " ")} algorithm`
      );
      return;
    }

    await this.narrator.speak(script.intro);
  }

  // Narrate algorithm step
  async narrateStep(stepType?: string, customText?: string) {
    if (!this.currentAlgorithm) return;

    const script = NARRATION_SCRIPTS[this.currentAlgorithm];
    if (!script) return;

    let text = customText;

    if (!text) {
      if (stepType && script.explanations[stepType]) {
        text = script.explanations[stepType];
      } else if (this.stepIndex < script.steps.length) {
        text = script.steps[this.stepIndex];
        this.stepIndex++;
      }
    }

    if (text && this.autoNarrate) {
      await this.narrator.speak(text);
    } else if (text) {
      this.narrator.queue(text);
    }
  }

  // Complete algorithm narration
  async completeAlgorithm() {
    if (!this.currentAlgorithm) return;

    const script = NARRATION_SCRIPTS[this.currentAlgorithm];
    if (script) {
      await this.narrator.speak(script.conclusion);
    }

    this.currentAlgorithm = null;
    this.stepIndex = 0;
  }

  // Control methods
  pause() {
    this.narrator.pause();
  }

  resume() {
    this.narrator.resume();
  }

  stop() {
    this.narrator.stop();
    this.currentAlgorithm = null;
    this.stepIndex = 0;
  }

  // Settings
  updateSettings(settings: Partial<VoiceSettings>) {
    this.narrator.updateSettings(settings);
  }

  setAutoNarrate(enabled: boolean) {
    this.autoNarrate = enabled;
  }

  // State
  getState() {
    return {
      ...this.narrator.getState(),
      currentAlgorithm: this.currentAlgorithm,
      stepIndex: this.stepIndex,
      autoNarrate: this.autoNarrate,
    };
  }

  // Manual speak
  speak(text: string, interrupt = false) {
    return this.narrator.speak(text, interrupt);
  }

  // Get available voices
  getVoices() {
    return this.narrator.getVoices();
  }

  // Event handler
  onStateChange(callback: (playing: boolean, paused: boolean) => void) {
    this.narrator.onStateChange(callback);
  }
}

// UI narration for accessibility
export class UInarrator {
  private narrator: VoiceNarrator;

  constructor(settings?: Partial<VoiceSettings>) {
    this.narrator = new VoiceNarrator({
      rate: 1.2, // Faster for UI feedback
      ...settings,
    });
  }

  // Announce UI changes
  async announceNavigation(page: string) {
    await this.narrator.speak(`Navigated to ${page}`, true);
  }

  async announceButtonClick(buttonName: string) {
    await this.narrator.speak(`${buttonName} activated`);
  }

  async announceStateChange(change: string) {
    await this.narrator.speak(change);
  }

  async announceError(error: string) {
    await this.narrator.speak(`Error: ${error}`, true);
  }

  async announceSuccess(message: string) {
    await this.narrator.speak(`Success: ${message}`);
  }

  // Form announcements
  async announceFormField(fieldName: string, value?: string) {
    const text = value
      ? `${fieldName} field, current value: ${value}`
      : `${fieldName} field`;
    await this.narrator.speak(text);
  }

  async announceValidationError(field: string, error: string) {
    await this.narrator.speak(`${field}: ${error}`, true);
  }

  // List and menu announcements
  async announceListItem(item: string, position: number, total: number) {
    await this.narrator.speak(`${item}, ${position} of ${total}`);
  }

  async announceMenuOpen(menuName: string) {
    await this.narrator.speak(`${menuName} menu opened`);
  }

  async announceMenuClose() {
    await this.narrator.speak("Menu closed");
  }

  // Control methods
  stop() {
    this.narrator.stop();
  }

  getState() {
    return this.narrator.getState();
  }
}

// React hooks for easy integration
import { useEffect, useRef, useState } from "react";

export function useVoiceNarrator(settings?: Partial<VoiceSettings>) {
  const narratorRef = useRef<VoiceNarrator | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    narratorRef.current = new VoiceNarrator(settings);
    narratorRef.current.onStateChange((playing, paused) => {
      setIsPlaying(playing);
      setIsPaused(paused);
    });

    return () => {
      narratorRef.current?.stop();
    };
  }, [settings]);

  const speak = (text: string, interrupt = false) => {
    return narratorRef.current?.speak(text, interrupt);
  };

  const pause = () => narratorRef.current?.pause();
  const resume = () => narratorRef.current?.resume();
  const stop = () => narratorRef.current?.stop();

  return {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    narrator: narratorRef.current,
  };
}

export function useAlgorithmNarrator(
  algorithm?: string,
  settings?: Partial<VoiceSettings>
) {
  const narratorRef = useRef<AlgorithmNarrator | null>(null);
  const [state, setState] = useState({
    isPlaying: false,
    isPaused: false,
    currentAlgorithm: null as string | null,
    autoNarrate: false,
  });

  useEffect(() => {
    narratorRef.current = new AlgorithmNarrator(settings);

    const updateState = () => {
      if (narratorRef.current) {
        setState(narratorRef.current.getState());
      }
    };

    narratorRef.current.onStateChange(updateState);

    return () => {
      narratorRef.current?.stop();
    };
  }, [settings]);

  useEffect(() => {
    if (algorithm && narratorRef.current) {
      narratorRef.current.startAlgorithm(algorithm);
    }
  }, [algorithm]);

  const startAlgorithm = (alg: string, autoNarrate = false) => {
    return narratorRef.current?.startAlgorithm(alg, autoNarrate);
  };

  const narrateStep = (stepType?: string, customText?: string) => {
    return narratorRef.current?.narrateStep(stepType, customText);
  };

  const completeAlgorithm = () => {
    return narratorRef.current?.completeAlgorithm();
  };

  const setAutoNarrate = (enabled: boolean) => {
    narratorRef.current?.setAutoNarrate(enabled);
    setState((prev) => ({ ...prev, autoNarrate: enabled }));
  };

  return {
    startAlgorithm,
    narrateStep,
    completeAlgorithm,
    setAutoNarrate,
    pause: () => narratorRef.current?.pause(),
    resume: () => narratorRef.current?.resume(),
    stop: () => narratorRef.current?.stop(),
    ...state,
    narrator: narratorRef.current,
  };
}

export function useUInarrator(settings?: Partial<VoiceSettings>) {
  const narratorRef = useRef<UInarrator | null>(null);

  useEffect(() => {
    narratorRef.current = new UInarrator(settings);

    return () => {
      narratorRef.current?.stop();
    };
  }, [settings]);

  return {
    announceNavigation: (page: string) =>
      narratorRef.current?.announceNavigation(page),
    announceButtonClick: (button: string) =>
      narratorRef.current?.announceButtonClick(button),
    announceStateChange: (change: string) =>
      narratorRef.current?.announceStateChange(change),
    announceError: (error: string) => narratorRef.current?.announceError(error),
    announceSuccess: (message: string) =>
      narratorRef.current?.announceSuccess(message),
    stop: () => narratorRef.current?.stop(),
    narrator: narratorRef.current,
  };
}
