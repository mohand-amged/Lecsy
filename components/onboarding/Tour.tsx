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
  const tooltipRef = useRef<HTMLDivElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const targetElRef = useRef<HTMLElement | null>(null);

  const step = steps[current];

  const updateTargetRect = () => {
    if (!step) return;
    const el = (document.querySelector(step.selector) as HTMLElement | null) || null;
    targetElRef.current = el;
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

  // Focus management
  useEffect(() => {
    if (visible) {
      nextBtnRef.current?.focus();
    }
  }, [visible, current]);

  useEffect(() => {
    if (!visible) return;
    updateTargetRect();

    // Ensure target is visible
    try {
      const el = document.querySelector(step?.selector || "") as HTMLElement | null;
      el?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      // re-measure after scroll animation
      setTimeout(updateTargetRect, 350);
    } catch {}

    // Observe size/position changes of target
    let resizeObs: ResizeObserver | null = null;
    let mutationObs: MutationObserver | null = null;
    if (targetElRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObs = new ResizeObserver(() => updateTargetRect());
      resizeObs.observe(targetElRef.current);
    }
    if (targetElRef.current && typeof MutationObserver !== 'undefined') {
      mutationObs = new MutationObserver(() => updateTargetRect());
      mutationObs.observe(targetElRef.current, { attributes: true, childList: true, subtree: true });
    }

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
      if (resizeObs && targetElRef.current) resizeObs.disconnect();
      if (mutationObs) mutationObs.disconnect();
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

  // Compute tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    const defaultStyle: React.CSSProperties = {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
    if (!targetRect) return defaultStyle;

    const TOOLTIP_MARGIN = 12;
    const TOOLTIP_WIDTH = Math.min(360, window.innerWidth - 24);
    const tooltipEl = tooltipRef.current;
    const tooltipHeight = tooltipEl?.getBoundingClientRect().height ?? 140;

    const centeredLeft = (targetRect.left + (targetRect.width - TOOLTIP_WIDTH) / 2);
    const clampedLeft = Math.min(
      Math.max(8, centeredLeft),
      window.innerWidth - TOOLTIP_WIDTH - 8
    );

    const place = step?.placement;

    const tryBottom = () => ({
      top: `${window.scrollY + targetRect.bottom + TOOLTIP_MARGIN}px`,
      left: `${window.scrollX + clampedLeft}px`,
      transform: "none" as const,
    });
    const tryTop = () => ({
      top: `${window.scrollY + targetRect.top - tooltipHeight - TOOLTIP_MARGIN}px`,
      left: `${window.scrollX + clampedLeft}px`,
      transform: "none" as const,
    });
    const tryRight = () => ({
      top: `${window.scrollY + Math.max(8, targetRect.top)}px`,
      left: `${window.scrollX + targetRect.right + TOOLTIP_MARGIN}px`,
      transform: "none" as const,
    });
    const tryLeft = () => ({
      top: `${window.scrollY + Math.max(8, targetRect.top)}px`,
      left: `${window.scrollX + targetRect.left - TOOLTIP_WIDTH - TOOLTIP_MARGIN}px`,
      transform: "none" as const,
    });

    const spaceAbove = targetRect.top;
    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceLeft = targetRect.left;
    const spaceRight = window.innerWidth - targetRect.right;

    // Respect explicit placement if possible
    if (place === 'bottom' && spaceBelow >= tooltipHeight + TOOLTIP_MARGIN) return tryBottom();
    if (place === 'top' && spaceAbove >= tooltipHeight + TOOLTIP_MARGIN) return tryTop();
    if (place === 'right' && spaceRight >= TOOLTIP_WIDTH + TOOLTIP_MARGIN) return tryRight();
    if (place === 'left' && spaceLeft >= TOOLTIP_WIDTH + TOOLTIP_MARGIN) return tryLeft();

    // Auto: prefer bottom, then top, then right, then left
    if (spaceBelow >= tooltipHeight + TOOLTIP_MARGIN) return tryBottom();
    if (spaceAbove >= tooltipHeight + TOOLTIP_MARGIN) return tryTop();
    if (spaceRight >= TOOLTIP_WIDTH + TOOLTIP_MARGIN) return tryRight();
    if (spaceLeft >= TOOLTIP_WIDTH + TOOLTIP_MARGIN) return tryLeft();

    return defaultStyle;
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[1000]"
      aria-modal="true"
      role="dialog"
      aria-label="Onboarding Tour"
    >
      {/* Dimmed overlay (pointer-events disabled to allow interacting with targets) */}
      <div
        className="absolute inset-0 bg-transparent"
        aria-hidden="true"
        style={{ pointerEvents: "none" }}
      />

      {/* Highlight box for target with background dim via giant shadow */}
      {targetRect && (
        <div
          className="absolute pointer-events-none border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] transition-all"
          style={{
            top: `${Math.max(0, window.scrollY + targetRect.top)}px`,
            left: `${Math.max(0, window.scrollX + targetRect.left)}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
            borderRadius: targetElRef.current ? getComputedStyle(targetElRef.current).borderRadius : '12px',
          }}
          aria-hidden="true"
        />
      )}

      {/* Tooltip panel */}
      <div
        ref={tooltipRef}
        className="absolute max-w-[360px] w-[min(360px,calc(100vw-24px))] bg-white text-black rounded-xl shadow-3xl p-4 md:p-5 transition-transform focus:outline-none"
        style={getTooltipStyle()}
        role="dialog"
        aria-live="polite"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 id="tour-title" className="text-lg font-bold">{step?.title}</h3>
            <p id="tour-desc" className="text-sm text-gray-700">{step?.content}</p>
          </div>
          <button
            aria-label="Skip tour"
            onClick={close}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress dots */}
        <div className="mt-3 flex items-center gap-1.5" aria-hidden="true">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === current ? 'w-4 bg-black' : 'w-2 bg-gray-300'}`}
            />
          ))}
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
              ref={nextBtnRef}
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

        {/* Optional separate Skip button for clarity */}
        <div className="mt-2 text-right">
          <button onClick={close} className="text-xs text-gray-500 underline">Skip tour</button>
        </div>
      </div>
    </div>
  );
}
