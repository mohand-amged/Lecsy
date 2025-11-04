"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export type TourStep = {
  selector: string; // CSS selector for target element
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right" | "auto";
};

export type TourProps = {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
};

const STORAGE_KEY = "onboarding.tourCompleted";

export function markTourCompleted() {
  try { localStorage.setItem(STORAGE_KEY, "true"); } catch {}
}
export function clearTourCompleted() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}
export function isTourCompleted(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === "true"; } catch { return false; }
}

export function Tour({ steps, isOpen, onClose, onComplete }: TourProps) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(isOpen);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const step = steps[current];

  const updateTargetRect = () => {
    if (!step) return;
    const el = document.querySelector(step.selector) as HTMLElement | null;
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  };

  useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (!visible) return;
    updateTargetRect();

    const handleResize = () => updateTargetRect();
    const handleKey = (e: KeyboardEvent) => {
      if (!visible) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
      window.removeEventListener("keydown", handleKey);
    };
  }, [visible, current, step?.selector]);

  const progress = useMemo(() => `${current + 1} / ${steps.length}`, [current, steps.length]);

  if (!visible) return null;

  const close = () => {
    setVisible(false);
    onClose();
  };

  const next = () => {
    if (current < steps.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      markTourCompleted();
      setVisible(false);
      onComplete?.();
      onClose();
    }
  };

  const prev = () => setCurrent((c) => Math.max(0, c - 1));

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[1000]"
      aria-modal="true"
      role="dialog"
      aria-label="Onboarding Tour"
    >
      {/* Dimmed overlay */}
      <div
        className="absolute inset-0 bg-black/60 transition-opacity"
        onClick={close}
        aria-hidden="true"
      />

      {/* Highlight box for target */}
      {targetRect && (
        <div
          className="absolute pointer-events-none border-2 border-white/80 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] transition-all"
          style={{
            top: `${Math.max(8, window.scrollY + targetRect.top - 8)}px`,
            left: `${Math.max(8, window.scrollX + targetRect.left - 8)}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`,
          }}
        />
      )}

      {/* Tooltip panel */}
      <div
        className="absolute max-w-[360px] w-[min(360px,calc(100vw-24px))] bg-white text-black rounded-xl shadow-3xl p-4 md:p-5 transition-transform"
        style={{
          top: targetRect ? `${window.scrollY + targetRect.bottom + 12}px` : "50%",
          left: targetRect ? `${window.scrollX + Math.min(targetRect.left, window.innerWidth - 380)}px` : "50%",
          transform: targetRect ? "none" : "translate(-50%, -50%)",
        }}
        role="region"
        aria-live="polite"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-lg font-bold">{step?.title}</h3>
            <p className="text-sm text-gray-700">{step?.content}</p>
          </div>
          <button
            aria-label="Skip tour"
            onClick={close}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-gray-500">Step {progress}</div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={prev}
              disabled={current === 0}
              aria-label="Previous step"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={next}
              aria-label={current === steps.length - 1 ? "Finish tour" : "Next step"}
              className="bg-black text-white hover:bg-gray-800"
            >
              {current === steps.length - 1 ? (
                <>Finish</>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
