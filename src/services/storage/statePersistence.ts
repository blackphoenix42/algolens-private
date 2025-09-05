/**
 * State persistence system for AlgoLens
 * Provides saving/loading of application and visualization states
 */

interface AppState {
  version: string;
  timestamp: number;
  theme: "light" | "dark" | "system";
  preferences: {
    narrationEnabled: boolean;
    performanceMonitorEnabled: boolean;
    animationSpeed: number;
    autoPlay: boolean;
  };
  visualizationState?: {
    algorithm: string;
    data: unknown[];
    step: number;
    isPlaying: boolean;
    speed: number;
    customizations: Record<string, unknown>;
  };
}

interface SavedState {
  id: string;
  name: string;
  description?: string;
  state: AppState;
  createdAt: number;
  updatedAt: number;
}

class StatePersistence {
  private static readonly STORAGE_KEY = "algolens-states";
  private static readonly AUTO_SAVE_KEY = "algolens-autosave";
  private static readonly VERSION = "1.0.0";

  // Save current application state
  static saveState(name: string, description?: string): string {
    const state: AppState = {
      version: this.VERSION,
      timestamp: Date.now(),
      theme: this.getCurrentTheme(),
      preferences: this.getCurrentPreferences(),
      visualizationState: this.getCurrentVisualizationState(),
    };

    const savedState: SavedState = {
      id: this.generateId(),
      name,
      description,
      state,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const existingStates = this.getAllStates();
    existingStates.push(savedState);

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingStates));
      return savedState.id;
    } catch (error) {
      console.error("Failed to save state:", error);
      throw new Error("Failed to save state");
    }
  }

  // Load a saved state
  static loadState(id: string): AppState | null {
    const states = this.getAllStates();
    const savedState = states.find((state) => state.id === id);

    if (!savedState) {
      return null;
    }

    // Update last accessed
    savedState.updatedAt = Date.now();
    this.updateState(savedState);

    return savedState.state;
  }

  // Get all saved states
  static getAllStates(): SavedState[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load states:", error);
      return [];
    }
  }

  // Delete a saved state
  static deleteState(id: string): boolean {
    const states = this.getAllStates();
    const filtered = states.filter((state) => state.id !== id);

    if (filtered.length === states.length) {
      return false; // State not found
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error("Failed to delete state:", error);
      return false;
    }
  }

  // Update an existing state
  static updateState(updatedState: SavedState): boolean {
    const states = this.getAllStates();
    const index = states.findIndex((state) => state.id === updatedState.id);

    if (index === -1) {
      return false;
    }

    states[index] = { ...updatedState, updatedAt: Date.now() };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(states));
      return true;
    } catch (error) {
      console.error("Failed to update state:", error);
      return false;
    }
  }

  // Auto-save current state
  static autoSave(): void {
    const state: AppState = {
      version: this.VERSION,
      timestamp: Date.now(),
      theme: this.getCurrentTheme(),
      preferences: this.getCurrentPreferences(),
      visualizationState: this.getCurrentVisualizationState(),
    };

    try {
      localStorage.setItem(this.AUTO_SAVE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }

  // Load auto-saved state
  static loadAutoSave(): AppState | null {
    try {
      const stored = localStorage.getItem(this.AUTO_SAVE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Failed to load auto-save:", error);
      return null;
    }
  }

  // Export states as JSON
  static exportStates(): string {
    const states = this.getAllStates();
    return JSON.stringify(
      {
        version: this.VERSION,
        exportedAt: Date.now(),
        states,
      },
      null,
      2
    );
  }

  // Import states from JSON
  static importStates(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      if (!data.states || !Array.isArray(data.states)) {
        throw new Error("Invalid import format");
      }

      const existingStates = this.getAllStates();
      const importedStates = data.states.map((state: SavedState) => ({
        ...state,
        id: this.generateId(), // Generate new IDs to avoid conflicts
        updatedAt: Date.now(),
      }));

      const allStates = [...existingStates, ...importedStates];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allStates));

      return true;
    } catch (error) {
      console.error("Failed to import states:", error);
      return false;
    }
  }

  // Clear all saved states
  static clearAllStates(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.AUTO_SAVE_KEY);
  }

  // Get storage usage info
  static getStorageInfo() {
    const states = this.getAllStates();
    const statesSize = new Blob([JSON.stringify(states)]).size;
    const autoSave = localStorage.getItem(this.AUTO_SAVE_KEY);
    const autoSaveSize = autoSave ? new Blob([autoSave]).size : 0;

    return {
      stateCount: states.length,
      totalSize: statesSize + autoSaveSize,
      statesSize,
      autoSaveSize,
      formattedSize: this.formatBytes(statesSize + autoSaveSize),
    };
  }

  // Helper methods
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  private static getCurrentTheme(): "light" | "dark" | "system" {
    // This would integrate with your theme system
    const stored = localStorage.getItem("theme");
    return (stored as "light" | "dark" | "system") || "system";
  }

  private static getCurrentPreferences() {
    // This would integrate with your preferences system
    return {
      narrationEnabled: false,
      performanceMonitorEnabled: false,
      animationSpeed: 1,
      autoPlay: false,
    };
  }

  private static getCurrentVisualizationState() {
    // This would integrate with your visualization state
    return {
      algorithm: "",
      data: [],
      step: 0,
      isPlaying: false,
      speed: 1,
      customizations: {} as Record<string, unknown>,
    };
  }

  private static formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

// React hook for state persistence
export function useStatePersistence() {
  const saveState = (name: string, description?: string) => {
    return StatePersistence.saveState(name, description);
  };

  const loadState = (id: string) => {
    return StatePersistence.loadState(id);
  };

  const getAllStates = () => {
    return StatePersistence.getAllStates();
  };

  const deleteState = (id: string) => {
    return StatePersistence.deleteState(id);
  };

  const exportStates = () => {
    const data = StatePersistence.exportStates();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `algolens-states-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importStates = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(StatePersistence.importStates(result));
      };
      reader.readAsText(file);
    });
  };

  const autoSave = () => {
    StatePersistence.autoSave();
  };

  const loadAutoSave = () => {
    return StatePersistence.loadAutoSave();
  };

  const getStorageInfo = () => {
    return StatePersistence.getStorageInfo();
  };

  const clearAllStates = () => {
    StatePersistence.clearAllStates();
  };

  return {
    saveState,
    loadState,
    getAllStates,
    deleteState,
    exportStates,
    importStates,
    autoSave,
    loadAutoSave,
    getStorageInfo,
    clearAllStates,
  };
}

export { StatePersistence };
export type { AppState, SavedState };
