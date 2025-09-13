import {
  Activity,
  Check,
  Download,
  Info,
  Keyboard,
  Palette,
  Play,
  RotateCcw,
  Save,
  Settings,
  Share2,
  Smartphone,
  Volume2,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import React, { useState } from "react";

import { usePerformance } from "@/providers/PerformanceProvider";
import { useVoiceNarration } from "@/providers/VoiceNarrationProvider";
import { usePWA } from "@/services";
import { cn } from "@/utils";

interface FeatureItem {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "active" | "available" | "offline" | "disabled";
  category: "core" | "advanced" | "accessibility" | "performance" | "pwa";
}

interface FeatureStatusPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function FeatureStatusPanel({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}: FeatureStatusPanelProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const { isNarrationEnabled } = useVoiceNarration();
  const { isMonitorVisible } = usePerformance();
  const { isOnline, isInstalled, canInstall } = usePWA();

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const onClose = externalOnClose || (() => setInternalIsOpen(false));

  const features: FeatureItem[] = [
    // Core Features
    {
      id: "algorithms",
      name: "Algorithm Visualizations",
      description: "Interactive sorting and searching algorithm animations",
      icon: Play,
      status: "active",
      category: "core",
    },
    {
      id: "responsive",
      name: "Responsive Design",
      description: "Optimized for desktop, tablet, and mobile devices",
      icon: Smartphone,
      status: "active",
      category: "core",
    },
    {
      id: "themes",
      name: "Dark/Light Themes",
      description: "Beautiful themes with system preference detection",
      icon: Palette,
      status: "active",
      category: "core",
    },

    // Advanced Features
    {
      id: "keyboard",
      name: "Keyboard Shortcuts",
      description: "20+ keyboard shortcuts for power users",
      icon: Keyboard,
      status: "active",
      category: "advanced",
    },
    {
      id: "export",
      name: "Export & Share",
      description: "Export as PNG, SVG, PDF, GIF, MP4, or code",
      icon: Download,
      status: "active",
      category: "advanced",
    },
    {
      id: "url-state",
      name: "Deep Linking",
      description: "Shareable URLs with algorithm state preservation",
      icon: Share2,
      status: "active",
      category: "advanced",
    },
    {
      id: "state-persistence",
      name: "Save & Load States",
      description: "Save algorithm states and restore them later",
      icon: Save,
      status: "active",
      category: "advanced",
    },
    {
      id: "animations",
      name: "Advanced Animations",
      description: "60fps optimized animations with physics effects",
      icon: Zap,
      status: "active",
      category: "advanced",
    },

    // Accessibility Features
    {
      id: "narration",
      name: "Voice Narration",
      description: "Audio descriptions for visually impaired users",
      icon: Volume2,
      status: isNarrationEnabled ? "active" : "available",
      category: "accessibility",
    },
    {
      id: "undo-redo",
      name: "Undo/Redo System",
      description: "Track and revert algorithm state changes",
      icon: RotateCcw,
      status: "active",
      category: "accessibility",
    },

    // Performance Features
    {
      id: "performance",
      name: "Performance Monitor",
      description: "Real-time FPS, memory, and Web Vitals tracking",
      icon: Activity,
      status: isMonitorVisible ? "active" : "available",
      category: "performance",
    },
    {
      id: "optimization",
      name: "Performance Optimization",
      description: "Automatic performance tuning and resource management",
      icon: Zap,
      status: "active",
      category: "performance",
    },

    // PWA Features
    {
      id: "offline",
      name: "Offline Support",
      description: "Works without internet connection",
      icon: Wifi,
      status: isOnline ? "available" : "active",
      category: "pwa",
    },
    {
      id: "install",
      name: "App Installation",
      description: "Install as native app on your device",
      icon: Smartphone,
      status: isInstalled ? "active" : canInstall ? "available" : "disabled",
      category: "pwa",
    },
  ];

  const getCategoryTitle = (category: FeatureItem["category"]) => {
    switch (category) {
      case "core":
        return "Core Features";
      case "advanced":
        return "Advanced Features";
      case "accessibility":
        return "Accessibility";
      case "performance":
        return "Performance";
      case "pwa":
        return "Progressive Web App";
      default:
        return "Features";
    }
  };

  const getStatusColor = (status: FeatureItem["status"]) => {
    switch (status) {
      case "active":
        return "text-green-600 dark:text-green-400";
      case "available":
        return "text-blue-600 dark:text-blue-400";
      case "offline":
        return "text-yellow-600 dark:text-yellow-400";
      case "disabled":
        return "text-gray-400 dark:text-gray-500";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: FeatureItem["status"]) => {
    switch (status) {
      case "active":
        return <Check className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case "available":
        return <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case "offline":
        return (
          <Wifi className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        );
      case "disabled":
        return <X className="h-4 w-4 text-gray-400 dark:text-gray-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const categorizedFeatures = features.reduce(
    (acc, feature) => {
      if (!acc[feature.category]) {
        acc[feature.category] = [];
      }
      acc[feature.category].push(feature);
      return acc;
    },
    {} as Record<string, FeatureItem[]>
  );

  const activeCount = features.filter((f) => f.status === "active").length;
  const totalCount = features.length;

  if (!isOpen) {
    return (
      <button
        onClick={() =>
          externalIsOpen !== undefined ? onClose() : setInternalIsOpen(true)
        }
        className={cn(
          "fixed right-20 bottom-4 z-40",
          "border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800",
          "rounded-lg p-3 shadow-lg",
          "dark:hover:bg-slate-750 transition-all duration-200 hover:bg-slate-50",
          "flex items-center gap-2"
        )}
        title="View Feature Status"
      >
        <Settings className="h-4 w-4" />
        <span className="text-xs font-medium">
          {activeCount}/{totalCount} Features
        </span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Feature Status
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {activeCount} of {totalCount} features are currently active
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "rounded-lg p-2",
              "hover:bg-slate-100 dark:hover:bg-slate-800",
              "transition-colors"
            )}
            title="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {Object.entries(categorizedFeatures).map(
            ([category, categoryFeatures]) => (
              <div key={category}>
                <h3 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-200">
                  {getCategoryTitle(category as FeatureItem["category"])}
                </h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {categoryFeatures.map((feature) => (
                    <div
                      key={feature.id}
                      className={cn(
                        "rounded-lg border p-4",
                        "bg-slate-50 dark:bg-slate-800/50",
                        "border-slate-200 dark:border-slate-700"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <feature.icon
                          className={cn(
                            "mt-0.5 h-5 w-5",
                            getStatusColor(feature.status)
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {feature.name}
                            </h4>
                            {getStatusIcon(feature.status)}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="mb-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Status Legend
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 text-green-600" />
              <span className="text-slate-600 dark:text-slate-400">Active</span>
            </div>
            <div className="flex items-center gap-1">
              <Info className="h-3 w-3 text-blue-600" />
              <span className="text-slate-600 dark:text-slate-400">
                Available
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Wifi className="h-3 w-3 text-yellow-600" />
              <span className="text-slate-600 dark:text-slate-400">
                Offline Mode
              </span>
            </div>
            <div className="flex items-center gap-1">
              <X className="h-3 w-3 text-gray-400" />
              <span className="text-slate-600 dark:text-slate-400">
                Disabled
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
