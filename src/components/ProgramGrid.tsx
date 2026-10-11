"use client";

import { useRef, useState, type CSSProperties } from "react";
import { Icon } from "./Icon";

const VISIBLE = 10;

type Props = { programs: string[]; showMore: string; showLess: string };

/** Список программ: видны первые 10, остальные — по кнопке «Показать ещё» (лишние скрывает CSS) */
export function ProgramGrid({ programs, showMore, showLess }: Props) {
  const [expanded, setExpanded] = useState(false);
  const grid = useRef<HTMLDivElement>(null);
  const hidden = programs.length - VISIBLE;

  const toggle = () => {
    // Сворачиваем — возвращаем к началу списка, чтобы не остаться далеко внизу страницы
    if (expanded && grid.current && grid.current.getBoundingClientRect().top < 0) grid.current.scrollIntoView({ behavior: "smooth", block: "start" });
    setExpanded(!expanded);
  };

  return (
    <>
      <div className={expanded ? "program-grid expanded" : "program-grid"} ref={grid}>
        {programs.map((name, i) => (
          <div key={i} style={i >= VISIBLE ? ({ "--n": Math.min(i - VISIBLE, 15) } as CSSProperties) : undefined}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            {name}
          </div>
        ))}
      </div>
      {hidden > 0 && (
        <button type="button" className={expanded ? "program-more open" : "program-more"} onClick={toggle} aria-expanded={expanded}>
          {expanded ? showLess : showMore.replace("{n}", String(hidden))} <Icon name="chevron" size={16} />
        </button>
      )}
    </>
  );
}
