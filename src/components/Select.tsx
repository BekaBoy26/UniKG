"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "./Icon";

type Props<T extends string> = {
  value: T;
  options: [T, string][];
  onChange: (value: T) => void;
  /** Подпись поля: показывается над кнопкой (или скрыта, если label не нужен визуально) */
  label: string;
  hideLabel?: boolean;
  className?: string;
};

/** Выпадающий список в стиле сайта вместо системного <select>: клавиатура (стрелки, Enter, Esc, Home/End), закрытие кликом вне */
export function Select<T extends string>({ value, options, onChange, label, hideLabel, className }: Props<T>) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const id = useId();
  const selectedIndex = Math.max(0, options.findIndex(([v]) => v === value));

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  // Активный пункт всегда в зоне видимости списка
  useEffect(() => {
    if (open) list.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const show = () => { setActive(selectedIndex); setOpen(true); };
  const pick = (index: number) => { onChange(options[index][0]); setOpen(false); };

  const onKeyDown = (e: KeyboardEvent) => {
    const last = options.length - 1;
    const move: Record<string, () => number> = { ArrowDown: () => Math.min(active + 1, last), ArrowUp: () => Math.max(active - 1, 0), Home: () => 0, End: () => last };
    if (move[e.key]) {
      e.preventDefault();
      if (!open) return show();
      setActive(move[e.key]());
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open) pick(active);
      else show();
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "Tab") setOpen(false);
  };

  return (
    <div className={`ui-select${open ? " open" : ""}${className ? ` ${className}` : ""}`} ref={root}>
      <span className={hideLabel ? "ui-select-label sr-only" : "ui-select-label"} id={`${id}-label`}>{label}</span>
      <button
        type="button"
        // Шаблон ARIA «select-only combobox»: фокус остаётся на кнопке, активный пункт — через aria-activedescendant
        role="combobox"
        className="ui-select-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-value`}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        aria-controls={`${id}-list`}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
      >
        <span id={`${id}-value`}>{options[selectedIndex]?.[1]}</span>
        <Icon name="chevron" size={16} />
      </button>
      {open && (
        <ul className="ui-select-list" role="listbox" id={`${id}-list`} aria-labelledby={`${id}-label`} ref={list}>
          {options.map(([v, text], i) => (
            <li
              key={v}
              id={`${id}-${i}`}
              role="option"
              aria-selected={v === value}
              className={i === active ? "active" : undefined}
              onPointerEnter={() => setActive(i)}
              onClick={() => pick(i)}
            >
              {text}
              {v === value && <Icon name="check" size={15} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
