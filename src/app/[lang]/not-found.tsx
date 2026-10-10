import Link from "next/link";
import { getI18n } from "@/i18n/dictionaries";

export default async function NotFound() {
  const { lang, dict } = await getI18n();
  return (
    <main className="not-found">
      <h1>{dict.notFound.title}</h1>
      <p>{dict.notFound.text}</p>
      <Link className="primary-button" href={`/${lang}`}>{dict.notFound.home}</Link>
    </main>
  );
}
