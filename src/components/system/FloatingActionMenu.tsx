import {
  Activity,
  Download,
  Info,
  Keyboard,
  MoreVertical,
  Volume2,
  VolumeX,
  X,
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
          "mb-2 flex flex-col gap-2 transition-all duration-300",
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        )}
      >
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg",
              "border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800",
              "dark:hover:bg-slate-750 transition-all duration-200 hover:bg-slate-50",
              "text-slate-700 dark:text-slate-200",
              item.active &&
                "border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20"
            )}
            title={item.label}
          >
            <item.icon
              className={cn(
                "h-4 w-4",
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
          "flex h-12 w-12 items-center justify-center rounded-full shadow-lg",
          "bg-blue-600 text-white hover:bg-blue-700",
          "transition-all duration-200",
          isOpen && "rotate-45"
        )}
        title={isOpen ? "Close Menu" : "Open Quick Actions"}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MoreVertical className="h-5 w-5" />
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
