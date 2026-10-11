"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { locales, localeNames, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { adminApi, fill, refreshCatalog, type AdminInstitution, type InstitutionDraft } from "@/lib/admin";
import { ApiError } from "@/lib/api";
import { fieldLabels, t, type FieldKey, type InstitutionType, type Localized, type Ownership } from "@/lib/institutions";
import { Icon } from "../Icon";
import { AdminTitle } from "./AdminOverview";
import { useAdminReady } from "./AdminShell";

type L = Record<Locale, string>;
type Form = {
  slug: string;
  type: InstitutionType;
  short: string;
  name: L;
  city: L;
  ownership: Ownership;
  fields: FieldKey[];
  image: string;
  description: L;
  languages: L;
  studyForm: L;
  tuition: string;
  programs: L[];
  website: string;
  address: L;
  sources: string;
  popularity: string;
};

type Props = {
  lang: Locale;
  dict: Dictionary["admin"];
  labels: Pick<Dictionary["common"], "university" | "college" | "state" | "private">;
  /** Нет id — создание нового; пустая строка — адрес без id (показываем «не найдено») */
  id?: string;
  initialType?: InstitutionType;
};

const toL = (v?: Localized | null): L => ({ ru: v?.ru ?? "", ky: v?.ky ?? "", en: v?.en ?? "" });
const emptyL = () => toL(null);

const emptyForm = (type: InstitutionType): Form => ({
  slug: "", type, short: "", name: emptyL(), city: emptyL(), ownership: "state", fields: [], image: "",
  description: emptyL(), languages: emptyL(), studyForm: emptyL(), tuition: "", programs: [], website: "",
  address: emptyL(), sources: "", popularity: "",
});

const fromInstitution = (i: AdminInstitution): Form => ({
  slug: i.slug,
  type: i.type,
  short: i.short,
  name: toL(i.name),
  city: toL(i.city),
  ownership: i.ownership,
  fields: i.fields,
  image: i.image ?? "",
  description: toL(i.description),
  languages: toL(i.languages),
  studyForm: toL(i.studyForm),
  tuition: i.tuitionFrom?.toString() ?? "",
  programs: i.programs.map(toL),
  website: i.website ?? "",
  address: toL(i.address),
  sources: i.sources.join("\n"),
  popularity: i.popularity?.toString() ?? "",
});

const number = (v: string) => (v.trim() === "" ? null : Number(v));

const toDraft = (f: Form): InstitutionDraft => ({
  slug: f.slug.trim(),
  type: f.type,
  short: f.short.trim(),
  name: f.name,
  city: f.city,
  ownership: f.ownership,
  fields: f.fields,
  image: f.image.trim() || null,
  description: f.description,
  languages: f.languages,
  studyForm: f.studyForm,
  tuitionFrom: number(f.tuition),
  programs: f.programs.filter((p) => p.ru.trim() || p.ky.trim() || p.en.trim()),
  website: f.website.trim() || null,
  address: f.address,
  sources: f.sources.split("\n").map((s) => s.trim()).filter(Boolean),
  popularity: number(f.popularity),
});

// Транслитерация для автоматического slug из сокращения (КРСУ → krsu)
const translit: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", ң: "n",
  о: "o", ө: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ү: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y",
  ь: "", э: "e", ю: "yu", я: "ya",
};
const slugify = (value: string) =>
  [...value.toLowerCase()].map((c) => translit[c] ?? c).join("").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

export function AdminInstitutionForm({ lang, dict, labels, id, initialType = "university" }: Props) {
  const router = useRouter();
  const editing = id !== undefined;
  const [form, setForm] = useState<Form | null>(editing ? null : emptyForm(initialType));
  const [title, setTitle] = useState("");
  const [loadError, setLoadError] = useState(editing && !id);
  const [contentLang, setContentLang] = useState<Locale>("ru");
  const [slugTouched, setSlugTouched] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const ready = useAdminReady();

  useEffect(() => {
    if (!id || !ready) return;
    let active = true;
    adminApi<AdminInstitution>(`/institutions/${id}`)
      .then((item) => {
        if (!active) return;
        setForm(fromInstitution(item));
        setTitle(t(item.name, lang));
      })
      .catch(() => active && setLoadError(true));
    return () => {
      active = false;
    };
  }, [id, lang, ready]);

  const type = form?.type ?? initialType;
  const listHref = `/${lang}/admin/${type === "university" ? "universities" : "colleges"}`;

  if (loadError || !form) {
    return (
      <>
        <AdminBack href={listHref} label={dict.backToList} />
        {loadError ? <p className="auth-alert error" role="alert">{dict.notFound}</p> : <div className="admin-card"><span className="admin-skeleton wide" /></div>}
      </>
    );
  }

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => (f ? { ...f, [key]: value } : f));
  const setL = (key: "name" | "city" | "description" | "languages" | "studyForm" | "address", value: string) =>
    setForm((f) => (f ? { ...f, [key]: { ...f[key], [contentLang]: value } } : f));
  const setShort = (value: string) =>
    setForm((f) => (f ? { ...f, short: value, slug: slugTouched ? f.slug : slugify(value) } : f));
  const toggleField = (key: FieldKey) =>
    set("fields", form.fields.includes(key) ? form.fields.filter((k) => k !== key) : [...form.fields, key]);
  const setProgram = (index: number, value: string) =>
    set("programs", form.programs.map((p, i) => (i === index ? { ...p, [contentLang]: value } : p)));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    const missing = [
      !form.short.trim() && dict.short,
      !form.slug.trim() && dict.slug,
      !form.name.ru.trim() && `${dict.name} (RU)`,
      !form.city.ru.trim() && `${dict.city} (RU)`,
    ].filter(Boolean);
    if (missing.length) {
      setError(fill(dict.errRequired, { fields: missing.join(", ") }));
      if (!form.name.ru.trim() || !form.city.ru.trim()) setContentLang("ru");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body = JSON.stringify(toDraft(form));
      await adminApi<AdminInstitution>(editing ? `/institutions/${id}` : "/institutions", { method: editing ? "PUT" : "POST", body });
      await refreshCatalog();
      router.push(listHref);
    } catch (e) {
      setError(e instanceof ApiError && e.status === 409 ? dict.errSlugExists : dict.errSave);
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!editing || !window.confirm(fill(dict.deleteConfirm, { name: title }))) return;
    setSaving(true);
    try {
      await adminApi(`/institutions/${id}`, { method: "DELETE" });
      await refreshCatalog();
      router.push(listHref);
    } catch {
      setError(dict.errSave);
      setSaving(false);
    }
  };

  const req = <span className="admin-required" title={dict.required}>*</span>;
  const localizedInput = (key: "name" | "city" | "languages" | "studyForm" | "address", label: string, required = false) => (
    <Field label={<>{label} {required && contentLang === "ru" && req}</>} lang={contentLang}>
      <input value={form[key][contentLang]} onChange={(e) => setL(key, e.target.value)} placeholder={contentLang === "ru" ? "" : form[key].ru} maxLength={300} />
    </Field>
  );

  return (
    <form className="admin-form" onSubmit={submit} noValidate>
      <AdminBack href={listHref} label={dict.backToList} />
      <AdminTitle
        kicker={type === "university" ? labels.university : labels.college}
        title={editing ? title || dict.editTitle : type === "university" ? dict.newUniversity : dict.newCollege}
      />

      {/* Язык, на котором сейчас заполняются переводимые поля */}
      <div className="admin-lang-bar">
        <div>
          <strong>{dict.contentLanguage}</strong>
          <span>{dict.contentLanguageHint}</span>
        </div>
        <div className="admin-segmented" role="tablist">
          {locales.map((l) => (
            <button type="button" role="tab" aria-selected={contentLang === l} className={contentLang === l ? "active" : undefined} onClick={() => setContentLang(l)} key={l}>
              {localeNames[l].code}
            </button>
          ))}
        </div>
      </div>

      <section className="admin-card admin-section">
        <h2>{dict.sectionMain}</h2>
        <div className="admin-grid">
          <Field label={dict.type} group>
            <Segmented value={form.type} onChange={(v) => set("type", v)} options={[["university", labels.university], ["college", labels.college]]} />
          </Field>
          <Field label={dict.ownership} group>
            <Segmented value={form.ownership} onChange={(v) => set("ownership", v)} options={[["state", labels.state], ["private", labels.private]]} />
          </Field>
          <Field label={<>{dict.short} {req}</>}>
            <input value={form.short} onChange={(e) => setShort(e.target.value)} maxLength={40} />
          </Field>
          <Field label={<>{dict.slug} {req}</>} hint={dict.slugHint}>
            <input value={form.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value.toLowerCase()); }} pattern="[a-z0-9-]+" maxLength={80} spellCheck={false} />
          </Field>
          <div className="admin-span">{localizedInput("name", dict.name, true)}</div>
          {localizedInput("city", dict.city, true)}
          <Field label={dict.popularity} hint={dict.popularityHint}>
            <input type="number" min={1} max={32767} step={1} value={form.popularity} onChange={(e) => set("popularity", e.target.value)} />
          </Field>
          <div className="admin-span">
            <Field label={dict.fields} group>
              <div className="admin-chips">
                {(Object.keys(fieldLabels) as FieldKey[]).map((key) => (
                  <button type="button" key={key} className={form.fields.includes(key) ? "active" : undefined} aria-pressed={form.fields.includes(key)} onClick={() => toggleField(key)}>
                    {form.fields.includes(key) && <Icon name="check" size={14} />} {t(fieldLabels[key], lang)}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <div className="admin-span admin-image-field">
            <Field label={dict.image} hint={dict.imageHint}>
              <input type="url" value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://…" spellCheck={false} />
            </Field>
            <span className="admin-image-preview">
              {/* eslint-disable-next-line @next/next/no-img-element -- предпросмотр внешней ссылки */}
              {form.image.trim() ? <img src={form.image.trim()} alt="" /> : <Icon name="eyeOff" size={20} />}
            </span>
          </div>
        </div>
      </section>

      <section className="admin-card admin-section">
        <h2>{dict.sectionAbout}</h2>
        <div className="admin-grid">
          <div className="admin-span">
            <Field label={dict.description} lang={contentLang}>
              <textarea rows={5} value={form.description[contentLang]} onChange={(e) => setL("description", e.target.value)} placeholder={contentLang === "ru" ? "" : form.description.ru} maxLength={5000} />
            </Field>
          </div>
          {localizedInput("languages", dict.languages)}
          {localizedInput("studyForm", dict.studyForm)}
          <Field label={dict.tuition} hint={dict.tuitionHint}>
            <input type="number" min={0} step={1000} value={form.tuition} onChange={(e) => set("tuition", e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="admin-card admin-section">
        <div className="admin-card-head">
          <h2>{dict.sectionPrograms} <small>{form.programs.length || ""}</small></h2>
          <button type="button" className="secondary-button" onClick={() => set("programs", [...form.programs, emptyL()])}>
            <Icon name="plus" size={17} /> {dict.programs}
          </button>
        </div>
        <ol className="admin-programs">
          {form.programs.map((p, i) => (
            <li key={i}>
              <span>{i + 1}</span>
              <input
                value={p[contentLang]}
                onChange={(e) => setProgram(i, e.target.value)}
                // Пустой перевод — подсказка на доступном языке
                placeholder={p.ru || p.ky || p.en}
                maxLength={300}
                aria-label={`${dict.programs} ${i + 1}`}
              />
              <button type="button" className="comment-delete" onClick={() => set("programs", form.programs.filter((_, j) => j !== i))} aria-label={dict.delete} title={dict.delete}>
                <Icon name="trash" size={16} />
              </button>
            </li>
          ))}
        </ol>
      </section>

      <section className="admin-card admin-section">
        <h2>{dict.sectionContacts}</h2>
        <div className="admin-grid">
          <Field label={dict.website}>
            <input type="url" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://…" spellCheck={false} />
          </Field>
          {localizedInput("address", dict.address)}
          <div className="admin-span">
            <Field label={dict.sources} hint={dict.sourcesHint}>
              <textarea rows={4} value={form.sources} onChange={(e) => set("sources", e.target.value)} placeholder="https://…" spellCheck={false} />
            </Field>
          </div>
        </div>
      </section>

      <div className="admin-savebar">
        {error && <p className="auth-alert error" role="alert">{error}</p>}
        <div>
          {editing && (
            <button type="button" className="secondary-button danger" onClick={remove} disabled={saving}>
              <Icon name="trash" size={17} /> {dict.delete}
            </button>
          )}
          <span />
          <Link className="secondary-button" href={listHref}>{dict.cancel}</Link>
          <button className="primary-button" type="submit" disabled={saving}>
            <Icon name="check" size={18} /> {saving ? dict.saving : dict.save}
          </button>
        </div>
      </div>
    </form>
  );
}

/** group — для набора кнопок: внутри <label> клик по подписи нажимал бы первую кнопку */
function Field({ label, hint, lang, group, children }: { label: ReactNode; hint?: string; lang?: Locale; group?: boolean; children: ReactNode }) {
  const Tag = group ? "div" : "label";
  return (
    <Tag className="admin-field" role={group ? "group" : undefined}>
      <span className="admin-field-label">
        {label}
        {lang && <i>{localeNames[lang].code}</i>}
      </span>
      {children}
      {hint && <small>{hint}</small>}
    </Tag>
  );
}

function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="admin-segmented wide">
      {options.map(([v, label]) => (
        <button type="button" key={v} className={value === v ? "active" : undefined} aria-pressed={value === v} onClick={() => onChange(v)}>{label}</button>
      ))}
    </div>
  );
}

function AdminBack({ href, label }: { href: string; label: string }) {
  return <Link className="admin-back" href={href}><Icon name="chevron" size={16} /> {label}</Link>;
}
