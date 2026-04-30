import { clsx } from "clsx";
import * as React from "react";

type Variant = "primary" | "ghost" | "soft";
type Size = "sm" | "md";

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
  }
>(function Button(
  { variant = "primary", size = "md", className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center gap-2 rounded-full font-medium tracking-tight transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-4 py-2.5 text-[13px]",
        variant === "primary" &&
          "bg-ink text-paper hover:bg-plum",
        variant === "ghost" &&
          "border border-rule text-t-1 hover:bg-paper-2",
        variant === "soft" &&
          "bg-paper-2 text-t-1 hover:bg-rule-2/60",
        className,
      )}
      {...rest}
    />
  );
});

export const IconButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function IconButton({ className, ...rest }, ref) {
  return (
    <button
      ref={ref}
      className={clsx(
        "inline-flex h-8 w-8 items-center justify-center rounded-full text-t-2 hover:bg-paper-2 hover:text-t-1",
        className,
      )}
      {...rest}
    />
  );
});

export function Input({
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "w-full rounded-lg border border-rule-2 bg-paper-soft px-3 py-2.5 text-sm text-t-1",
        "placeholder:text-t-4 focus:border-plum focus:outline-none focus:ring-2 focus:ring-plum/20",
        className,
      )}
      {...rest}
    />
  );
}

export function Textarea({
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        "w-full rounded-lg border border-rule-2 bg-paper-soft px-3 py-2.5 text-sm text-t-1",
        "placeholder:text-t-4 focus:border-plum focus:outline-none focus:ring-2 focus:ring-plum/20",
        className,
      )}
      {...rest}
    />
  );
}

export function Label({
  className,
  ...rest
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={clsx(
        "label mb-1 block",
        className,
      )}
      {...rest}
    />
  );
}
