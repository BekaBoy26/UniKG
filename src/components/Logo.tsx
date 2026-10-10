import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";

export function Logo({ lang, label }: { lang: Locale; label: string }) {
  return (
    <Link className="logo" href={`/${lang}`} aria-label={label}>
      <Image className="logo-mark" src="/logo.png" width={36} height={36} alt="" priority />
      <span>UniKG</span>
    </Link>
  );
}
