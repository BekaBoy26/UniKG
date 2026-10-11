import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./Icon";

type Props = {
  kicker: string;
  title: string;
  text: string;
  seeAllHref: string;
  /** Подпись плитки «Смотреть все», например «30 вариантов» */
  total: string;
  labels: { seeAll: string };
  children: ReactNode;
};

/** Подборка на главной: несколько карточек и плитка «Смотреть все» в конце ряда */
export function Carousel({ kicker, title, text, seeAllHref, total, labels, children }: Props) {
  return (
    <section className="content-section" data-reveal="up">
      <div className="section-kicker">{kicker}</div>
      <div className="section-heading">
        <div><h2>{title}</h2><p>{text}</p></div>
      </div>
      <div className="card-carousel">
        {children}
        <Link className="see-all-card" href={seeAllHref}>
          <span className="see-all-icon"><Icon name="arrow" size={22} /></span>
          <strong>{labels.seeAll}</strong>
          <small>{total}</small>
        </Link>
      </div>
    </section>
  );
}
