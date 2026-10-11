"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";

/** Кнопка «Наверх»: появляется, когда страницу прокрутили больше чем на полтора экрана */
export function ScrollTopButton({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 1.5);
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button type="button" className={visible ? "scroll-top visible" : "scroll-top"} onClick={toTop} aria-label={label} title={label} tabIndex={visible ? 0 : -1} aria-hidden={!visible}>
      <Icon name="arrowUp" size={20} />
    </button>
  );
}
