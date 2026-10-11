"use client";

import { useEffect } from "react";

const SELECTOR = "[data-reveal]:not([data-revealed])";

/**
 * Проявляет элементы с атрибутом data-reveal, когда они доходят до экрана (один раз). Стоит один раз в layout:
 * новые блоки (переход между страницами, догрузка через Suspense) подхватывает MutationObserver.
 * Вариант анимации — значение атрибута (up, left, right, zoom, line), задержка — CSS-переменная --d.
 * Появившемуся элементу ставится атрибут data-revealed (не класс: className React перезаписывает при ререндере).
 * Без JS элементы видны сразу (стиль в noscript).
 */
export function ScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    const observe = (root: Element | Document) => {
      if (root instanceof Element && root.matches(SELECTOR)) io.observe(root);
      root.querySelectorAll(SELECTOR).forEach((el) => io.observe(el));
    };
    observe(document);
    const mo = new MutationObserver((records) => {
      for (const record of records) record.addedNodes.forEach((node) => node instanceof Element && observe(node));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return (
    <noscript>
      <style>{"[data-reveal], [data-reveal] * { opacity: 1 !important; transform: none !important; }"}</style>
    </noscript>
  );
}
