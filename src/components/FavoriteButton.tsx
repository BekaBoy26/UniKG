"use client";

import { useFavorites } from "./favorites";
import { Icon } from "./Icon";

type Props = {
  slug: string;
  labels: { add: string; remove: string; saved?: string };
  /** С подписью — для страницы учебного заведения; без — круглая кнопка на карточке */
  withText?: boolean;
  className?: string;
};

/** Сердечко «в избранное». Стоит рядом со ссылкой-карточкой, поэтому клик не уходит в переход по ссылке */
export function FavoriteButton({ slug, labels, withText, className }: Props) {
  const { has, toggle } = useFavorites();
  const saved = has(slug);
  const label = saved ? labels.remove : labels.add;
  return (
    <button
      type="button"
      className={`fav-button${saved ? " saved" : ""}${withText ? " with-text" : ""}${className ? ` ${className}` : ""}`}
      aria-pressed={saved}
      aria-label={withText ? undefined : label}
      title={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
    >
      {/* key пересоздаёт иконку — так при добавлении проигрывается «пульс» */}
      <span className="fav-icon" key={saved ? "on" : "off"}><Icon name="heart" size={withText ? 18 : 19} /></span>
      {withText && <span>{saved ? (labels.saved ?? labels.remove) : labels.add}</span>}
    </button>
  );
}
