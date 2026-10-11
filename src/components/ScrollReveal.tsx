"use client";

import { useEffect } from "react";

/**
 * Проявляет элементы с атрибутом data-reveal, когда они доходят до экрана (один раз).
 * Вариант анимации — значение атрибута (up, left, right, zoom, line), задержка — CSS-переменная --d.
 * Без JS элементы видны сразу (стиль в noscript).
 */
export function ScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    document.querySelectorAll("[data-reveal]:not(.revealed)").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <noscript>
      <style>{"[data-reveal], [data-reveal] * { opacity: 1 !important; transform: none !important; }"}</style>
    </noscript>
  );
}
