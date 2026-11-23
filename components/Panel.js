import clsx from "clsx";

export function Panel({ title, action, className, children }) {
  return (
    <section className={clsx("rounded-lg border border-line bg-surface shadow-panel", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          {title && <h2 className="font-display text-sm font-bold text-ink">{title}</h2>}
          {action}
        </div>
      )}
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}

export function StatInline({ label, value, hint, tone = "ink" }) {
  const toneClass = { ink: "text-ink", brick: "text-brick-600", clay: "text-clay-600", brand: "text-brand-600" }[tone];
  return (
    <div className="min-w-[9rem] flex-1 px-5 py-4 first:pl-0 last:pr-0">
      <p className="text-xs font-medium text-faint">{label}</p>
      <p className={clsx("font-display text-2xl font-extrabold", toneClass)}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function FormField({ label, error, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-brick-600">{error}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";
