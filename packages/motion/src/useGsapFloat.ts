import { useEffect, type RefObject } from "react";

type GsapTween = { kill?: () => void };

type GsapLike = {
  to: (
    target: Element,
    options: {
      y: number;
      duration: number;
      ease: string;
      repeat: number;
      yoyo: boolean;
    }
  ) => GsapTween;
};

declare global {
  interface Window {
    gsap?: GsapLike;
  }
}

let gsapScriptPromise: Promise<GsapLike | null> | null = null;

function loadGsapFromCdn(): Promise<GsapLike | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.gsap?.to) return Promise.resolve(window.gsap);
  if (gsapScriptPromise) return gsapScriptPromise;

  gsapScriptPromise = new Promise(resolve => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-gsap="true"]'
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(window.gsap ?? null), {
        once: true,
      });
      existing.addEventListener("error", () => resolve(null), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/gsap.min.js";
    script.async = true;
    script.dataset.gsap = "true";
    script.onload = () => resolve(window.gsap ?? null);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });

  return gsapScriptPromise;
}

type UseGsapFloatOptions = {
  amplitude?: number;
  duration?: number;
  autoLoadScript?: boolean;
};

export function useGsapFloat(
  ref: RefObject<HTMLElement | null>,
  options?: UseGsapFloatOptions
) {
  const amplitude = options?.amplitude ?? 8;
  const duration = options?.duration ?? 2.4;
  const autoLoadScript = options?.autoLoadScript ?? true;

  useEffect(() => {
    const target = ref.current;
    if (!target) return;

    let activeTween: GsapTween | null = null;
    let disposed = false;

    const start = async () => {
      const gsap = window.gsap ?? (autoLoadScript ? await loadGsapFromCdn() : null);
      if (!gsap?.to || disposed) return;

      activeTween = gsap.to(target, {
        y: -Math.abs(amplitude),
        duration,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    };

    void start();

    return () => {
      disposed = true;
      activeTween?.kill?.();
    };
  }, [ref, amplitude, duration, autoLoadScript]);
}
