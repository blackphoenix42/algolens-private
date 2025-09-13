import "./OnboardingTour.css";

import { ChevronLeft, ChevronRight, Play, RotateCcw, X } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { usePreferences } from "@/hooks/usePreferences";
import { log } from "@/services/monitoring";
import { cn } from "@/utils";

interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for the element to highlight
  position?: "top" | "bottom" | "left" | "right" | "center";
  action?: "click" | "hover" | "none";
  demo?: () => void; // Optional demo function to run
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  tourType?: "homepage" | "visualizer" | "full";
}

const tourSteps: Record<string, TourStep[]> = {
  homepage: [
    {
      id: "welcome",
      title: "Welcome to AlgoLens! 🔬",
      content:
        "Let's take a quick tour to help you get started with exploring algorithms and data structures.",
      position: "center",
    },
    {
      id: "hero",
      title: "Algorithm Showcase",
      content:
        "This is your starting point. Browse featured algorithms or use the search to find specific ones.",
      target: "[data-tour='hero-section']",
      position: "bottom",
    },
    {
      id: "search",
      title: "Search & Filter",
      content:
        "Use the search bar and filters to find algorithms by name, category, or complexity.",
      target: "[data-tour='search-bar']",
      position: "bottom",
    },
    {
      id: "algorithm-cards",
      title: "Algorithm Cards",
      content:
        "Click on any card to start visualizing that algorithm. Each card shows key information and complexity. If no cards are visible, try adjusting your search filters.",
      target: "[data-tour='algorithm-card']",
      position: "center", // Changed to center as fallback
    },
    {
      id: "theme-toggle",
      title: "Theme Options",
      content: "Switch between light and dark themes for comfortable viewing.",
      target: "[data-tour='theme-toggle']",
      position: "left",
    },
  ],
  visualizer: [
    {
      id: "visualizer-welcome",
      title: "Algorithm Visualizer 🎬",
      content:
        "Here you can watch algorithms in action! Let's explore the key features.",
      position: "center",
    },
    {
      id: "canvas",
      title: "Visualization Canvas",
      content:
        "This is where the magic happens - watch algorithms sort, search, and process data in real-time.",
      target: "[data-tour='visualization-canvas']",
      position: "top",
    },
    {
      id: "controls",
      title: "Playback Controls",
      content:
        "Control the animation speed, step through manually, or jump to specific points.",
      target: "[data-tour='transport-controls']",
      position: "top",
    },
    {
      id: "speed-controls",
      title: "Speed Presets",
      content:
        "Quick speed buttons for common playback rates: 0.25×, 0.5×, 1×, 2×, 4×",
      target: "[data-tour='speed-controls']",
      position: "top",
    },
    {
      id: "algorithm-info",
      title: "Algorithm Information",
      content:
        "Learn about the algorithm's complexity, properties, and implementation details.",
      target: "[data-tour='algorithm-info']",
      position: "left",
    },
    {
      id: "complexity-analysis",
      title: "Complexity Explorer",
      content:
        "Dive deep into time and space complexity with interactive visualizations and comparisons.",
      target: "[data-tour='complexity-explorer']",
      position: "left",
    },
    {
      id: "export-options",
      title: "Export Features",
      content:
        "Save your visualizations as PNG, SVG, or even animated GIFs and videos.",
      target: "[data-tour='export-controls']",
      position: "left",
    },
  ],
  full: [], // Will be combined from homepage + visualizer
};

// Combine tours for full experience
tourSteps.full = [...tourSteps.homepage, ...tourSteps.visualizer];

export default function OnboardingTour({
  isOpen,
  onClose,
  onComplete,
  tourType = "homepage",
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(
    null
  );
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isWaitingForElement, setIsWaitingForElement] = useState(false);
  const { markOnboardingTourSeen, preferences, resetOnboardingTour } =
    usePreferences();

  // Handle "don't show again" state change
  const handleDontShowAgainChange = useCallback(
    (checked: boolean) => {
      if (import.meta.env.DEV) {
        console.log("Don't show again changed:", checked);
      }
      setDontShowAgain(checked);
      if (checked) {
        // Immediately mark as seen when user checks the box
        if (import.meta.env.DEV) {
          console.log("Marking onboarding tour as seen immediately");
        }
        markOnboardingTourSeen();
      } else {
        // Re-enable tour if unchecked
        if (import.meta.env.DEV) {
          console.log("Re-enabling onboarding tour");
        }
        // This will reset the tour preference to show again
        resetOnboardingTour();
      }
    },
    [markOnboardingTourSeen, resetOnboardingTour]
  );

  const steps = tourSteps[tourType] || tourSteps.homepage;
  const step = steps[currentStep];

  // Log tour interactions
  useEffect(() => {
    if (isOpen) {
      log.user.action("Onboarding tour started", {
        tourType,
        totalSteps: steps.length,
      });
      // Always start from step 1 (index 0)
      setCurrentStep(0);
      // Set checkbox state based on current preferences - if tour is disabled, checkbox should be checked
      const isCurrentlyDisabled = !preferences.showOnboardingTour;
      setDontShowAgain(isCurrentlyDisabled);
    }
  }, [isOpen, tourType, steps.length, preferences.showOnboardingTour]);

  const highlightElement = useCallback(
    (selector?: string) => {
      // Remove previous highlight
      if (highlightedElement) {
        highlightedElement.classList.remove("tour-highlight");
      }

      if (selector) {
        setIsWaitingForElement(true);
        const tryHighlight = (attempt = 1) => {
          const element = document.querySelector(selector);
          if (element) {
            element.classList.add("tour-highlight");
            setHighlightedElement(element);
            setIsWaitingForElement(false);

            // Scroll element into view
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "center",
            });
          } else if (attempt < 5) {
            // Retry up to 5 times with increasing delay for better reliability
            if (import.meta.env.DEV) {
              console.log(
                `Tour element not found (attempt ${attempt}): ${selector}, retrying...`
              );
            }
            setIsWaitingForElement(true);
            setTimeout(() => tryHighlight(attempt + 1), attempt * 300);
          } else {
            if (import.meta.env.DEV) {
              console.warn(
                `Tour target element not found after 5 attempts: ${selector}, proceeding without highlight`
              );
            }
            setHighlightedElement(null);
            setIsWaitingForElement(false);
          }
        };

        tryHighlight();
      } else {
        setHighlightedElement(null);
        setIsWaitingForElement(false);
      }
    },
    [highlightedElement]
  );

  // Update highlight when step changes
  useEffect(() => {
    if (isOpen && step) {
      // Add a small delay to ensure DOM elements are loaded
      const timeoutId = setTimeout(() => {
        highlightElement(step.target);
      }, 100);

      return () => clearTimeout(timeoutId);
    }

    return () => {
      // Clean up highlights when component unmounts
      if (highlightedElement) {
        highlightedElement.classList.remove("tour-highlight");
      }
    };
  }, [currentStep, isOpen, step, highlightElement, highlightedElement]);

  const handleComplete = useCallback(() => {
    log.user.action("Tour completed", { tourType, totalSteps: steps.length });

    // Mark onboarding as seen if "don't show again" was checked and not already marked
    // (it may have already been marked when the checkbox was checked)
    if (dontShowAgain) {
      markOnboardingTourSeen();
    }

    onComplete();
    onClose();
  }, [
    tourType,
    steps.length,
    onComplete,
    onClose,
    dontShowAgain,
    markOnboardingTourSeen,
  ]);

  const nextStep = useCallback(() => {
    if (import.meta.env.DEV) {
      console.log("Next step called", {
        currentStep,
        totalSteps: steps.length,
      });
    }
    if (currentStep < steps.length - 1) {
      const nextStepIndex = currentStep + 1;
      if (import.meta.env.DEV) {
        console.log("Moving to step:", nextStepIndex);
      }
      setCurrentStep(nextStepIndex);
      log.user.action("Tour step forward", {
        step: nextStepIndex,
        stepId: steps[nextStepIndex]?.id,
      });
    } else {
      if (import.meta.env.DEV) {
        console.log("Tour complete");
      }
      handleComplete();
    }
  }, [currentStep, steps, handleComplete]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      log.user.action("Tour step backward", {
        step: currentStep - 1,
        stepId: steps[currentStep - 1]?.id,
      });
    }
  }, [currentStep, steps]);

  const skipTour = useCallback(() => {
    log.user.action("Tour skipped", { atStep: currentStep, stepId: step?.id });
    onClose();
  }, [currentStep, step, onClose]);

  // moved handleComplete earlier

  const restartTour = useCallback(() => {
    setCurrentStep(0);
    log.user.action("Tour restarted", { tourType });
  }, [tourType]);

  const runDemo = useCallback(() => {
    if (step?.demo) {
      log.user.action("Tour demo triggered", { stepId: step.id });
      step.demo();
    }
  }, [step]);

  // Memoized button content to ensure proper rendering
  const nextButtonContent = useMemo(() => {
    const isLastStep = currentStep === steps.length - 1;
    return (
      <>
        {isLastStep ? "Complete" : "Next"}
        {!isLastStep && <ChevronRight className="h-4 w-4" />}
      </>
    );
  }, [currentStep, steps.length]);

  if (!isOpen || !step) return null;

  // Calculate position for the tour card
  const getCardPosition = () => {
    if (!step.target || step.position === "center") {
      return {
        position: "fixed" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const element = document.querySelector(step.target);
    if (!element) {
      if (import.meta.env.DEV) {
        console.warn(
          `Tour target element not found for positioning: ${step.target}, falling back to center`
        );
      }
      return {
        position: "fixed" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const rect = element.getBoundingClientRect();
    const margin = 20;

    switch (step.position) {
      case "top":
        return {
          position: "fixed" as const,
          top: `${Math.max(margin, rect.top - 200)}px`,
          left: `${rect.left}px`,
        };
      case "bottom":
        return {
          position: "fixed" as const,
          top: `${rect.bottom + margin}px`,
          left: `${rect.left}px`,
        };
      case "left":
        return {
          position: "fixed" as const,
          top: `${rect.top}px`,
          left: `${Math.max(margin, rect.left - 320)}px`,
        };
      case "right":
        return {
          position: "fixed" as const,
          top: `${rect.top}px`,
          left: `${rect.right + margin}px`,
        };
      default:
        return {
          position: "fixed" as const,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        };
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />

      {/* Tour Card */}
      <Card
        className={cn(
          "z-50 w-80 max-w-[90vw] p-6 shadow-2xl",
          step.position === "center"
            ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform"
            : "fixed"
        )}
        style={step.position !== "center" ? getCardPosition() : {}}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {step.title}
            </h3>
          </div>
          <button
            onClick={skipTour}
            className="rounded p-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Skip tour"
            aria-label="Skip tour"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="leading-relaxed text-slate-600 dark:text-slate-400">
            {step.content}
          </p>
          {isWaitingForElement && (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <div className="border-primary-600 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
              <span>Looking for page element...</span>
            </div>
          )}
        </div>

        {/* Demo Button */}
        {step.demo && (
          <div className="mb-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={runDemo}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Try Demo
            </Button>
          </div>
        )}

        {/* Progress */}
        <div className="mb-4">
          <div className="mb-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Step {currentStep + 1} of {steps.length}
            </span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="bg-primary-600 progress-bar h-1.5 rounded-full"
              data-progress={Math.round(
                ((currentStep + 1) / steps.length) * 100
              )}
            />
          </div>
        </div>

        {/* Don't Show Again Option - Only show on first step */}
        {currentStep === 0 && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
            <label className="group flex cursor-pointer items-center gap-3 text-sm">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => handleDontShowAgainChange(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer-checked:bg-primary-600 peer-checked:border-primary-600 peer-focus:ring-primary-500 group-hover:border-primary-400 flex h-5 w-5 items-center justify-center rounded border-2 border-slate-300 transition-all duration-200 peer-focus:ring-2 peer-focus:ring-offset-1 dark:border-slate-600">
                  {dontShowAgain && (
                    <svg
                      className="h-3 w-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Don't show this tour again
                </span>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  You can always restart the tour from the settings menu
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={restartTour}
              className="flex items-center gap-1"
              title="Restart tour"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={skipTour}>
              Skip
            </Button>

            <Button
              key={`next-${currentStep}`}
              variant="primary"
              size="sm"
              onClick={nextStep}
              className="flex items-center gap-1"
            >
              {nextButtonContent}
            </Button>
          </div>
        </div>
      </Card>

      {/* Custom styles for highlighting */}
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.5);
          border-radius: 8px;
          animation: tour-pulse 2s infinite;
        }

        @keyframes tour-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.5);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(99, 102, 241, 0.3);
          }
        }
      `}</style>
    </>
  );
}
