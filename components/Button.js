import clsx from "clsx";

const VARIANTS = {
  primary: "bg-clay-500 text-white hover:bg-clay-600 shadow-sm",
  secondary: "bg-transparent text-brand-800 border border-brand-800/25 hover:bg-brand-900/5",
  ghost: "bg-transparent text-brand-700 hover:bg-brand-900/5",
  danger: "bg-transparent text-brick-600 border border-brick-500/30 hover:bg-brick-100",
};

export default function Button({ variant = "primary", className, as: Component = "button", children, disabled, ...props }) {
  return (
    <Component
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </Component>
  );
}
