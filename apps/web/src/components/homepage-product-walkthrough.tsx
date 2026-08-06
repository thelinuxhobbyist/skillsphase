"use client";

import { useEffect, useRef, useState } from "react";
import { ProfileShell } from "@/components/homepage-product-mocks";

export function ProductWalkthrough({
  callouts,
}: {
  callouts: { label: string; detail?: string }[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActiveIndex(Math.max(0, callouts.length - 1));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number(entry.target.getAttribute("data-index"));
          if (!Number.isFinite(index)) continue;
          if (entry.isIntersecting) {
            setActiveIndex((current) => Math.max(current, index));
          } else if (entry.boundingClientRect.top > 0) {
            setActiveIndex((current) =>
              current === index ? Math.max(0, index - 1) : current,
            );
          }
        }
      },
      { threshold: 0.5, rootMargin: "-15% 0px -15% 0px" },
    );

    for (const el of stepRefs.current) {
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [callouts.length]);

  return (
    <div className="grid items-start gap-[70px] lg:grid-cols-[1fr_0.85fr]">
      <ol className="flex flex-col">
        {callouts.map((item, index) => {
          const on = index <= activeIndex;
          return (
            <li
              key={item.label}
              ref={(el) => {
                stepRefs.current[index] = el;
              }}
              data-index={index}
              className={`flex gap-5 border-t border-[color:var(--line)] py-11 transition-opacity duration-400 last:border-b ${
                on ? "opacity-100" : "opacity-55"
              }`}
            >
              <span
                className={`inline-flex size-[34px] shrink-0 items-center justify-center rounded-full border-[1.5px] font-display text-[15px] font-semibold transition-colors duration-400 ${
                  on
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-[color:var(--emerald-line,var(--line))] text-[color:var(--stamp-dark,var(--primary))]"
                }`}
              >
                {index + 1}
              </span>
              <div>
                <h3 className="font-display text-[19px] font-semibold text-[color:var(--ink)]">
                  {item.label}
                </h3>
                {item.detail ? (
                  <p className="mt-2 max-w-[400px] text-[15px] leading-relaxed text-[color:var(--ink-soft)]">
                    {item.detail}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="lg:sticky lg:top-[110px]">
        <ProfileShell activeCount={activeIndex + 1} />
      </div>
    </div>
  );
}
