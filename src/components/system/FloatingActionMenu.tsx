import {
  Volume2,
  VolumeX,
  Download,
  Activity,
  Keyboard,
  MoreVertical,
  X,
  Info,
} from "lucide-react";
import React, { useState } from "react";

import { FeatureStatusPanel } from "@/components/panels/FeatureStatusPanel";
import { usePerformance } from "@/providers/PerformanceProvider";
import { useVoiceNarration } from "@/providers/VoiceNarrationProvider";
import { cn } from "@/utils";

export function FloatingActionMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showFeatureStatus, setShowFeatureStatus] = useState(false);
  const { isNarrationEnabled, toggleNarration } = useVoiceNarration();
  const { toggleMonitorVisibility } = usePerformance();

  const menuItems = [
    {
      icon: isNarrationEnabled ? Volume2 : VolumeX,
      label: "Toggle Narration",
      onClick: toggleNarration,
      active: isNarrationEnabled,
    },
    {
      icon: Activity,
      label: "Performance Monitor",
      onClick: toggleMonitorVisibility,
      active: false,
    },
    {
      icon: Download,
      label: "Export Options",
      onClick: () => {
        // This would open export menu
        console.log("Export menu would open here");
      },
      active: false,
    },
    {
      icon: Keyboard,
      label: "Keyboard Shortcuts",
      onClick: () => {
        // This would open keyboard shortcuts
        const event = new KeyboardEvent("keydown", { key: "?" });
        document.dispatchEvent(event);
      },
      active: false,
    },
    {
      icon: Info,
      label: "Feature Status",
      onClick: () => setShowFeatureStatus(true),
      active: false,
    },
  ];

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Menu Items */}
      <div
        className={cn(
          "flex flex-col gap-2 mb-2 transition-all duration-300",
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg",
              "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
              "hover:bg-slate-50 dark:hover:bg-slate-750 transition-all duration-200",
              "text-slate-700 dark:text-slate-200",
              item.active &&
                "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
            )}
            title={item.label}
          >
            <item.icon
              className={cn(
                "w-4 h-4",
                item.active && "text-blue-600 dark:text-blue-400"
              )}
            />
            <span className="text-sm font-medium whitespace-nowrap">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-center w-12 h-12 rounded-full shadow-lg",
          "bg-blue-600 hover:bg-blue-700 text-white",
          "transition-all duration-200",
          isOpen && "rotate-45"
        )}
        title={isOpen ? "Close Menu" : "Open Quick Actions"}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <MoreVertical className="w-5 h-5" />
        )}
      </button>

      {/* Feature Status Panel */}
      <FeatureStatusPanel
        isOpen={showFeatureStatus}
        onClose={() => setShowFeatureStatus(false)}
      />
    </div>
  );
}
