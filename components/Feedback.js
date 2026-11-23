import { AlertTriangle, CheckCircle2, Info, Inbox } from "lucide-react";
import clsx from "clsx";

const TONES = {
  error: { bg: "bg-brick-100", text: "text-brick-600", Icon: AlertTriangle },
  success: { bg: "bg-moss-100", text: "text-moss-600", Icon: CheckCircle2 },
  info: { bg: "bg-brand-100", text: "text-brand-700", Icon: Info },
};

export function Alert({ tone = "info", children, className }) {
  const { bg, text, Icon } = TONES[tone];
  return (
    <div className={clsx("flex items-start gap-2.5 rounded-md px-3.5 py-2.5 text-sm", bg, text, className)} role={tone === "error" ? "alert" : "status"}>
      <Icon size={17} className="mt-0.5 shrink-0" />
      <span className="leading-snug">{children}</span>
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <Inbox size={30} className="text-faint" strokeWidth={1.5} />
      <p className="font-display text-base font-semibold text-ink">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
