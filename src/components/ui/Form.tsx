"use client";

import Link from "next/link";
import clsx from "clsx";
import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { phoneMask } from "@/lib/format";

/** Labelled text field with an error line. */
export function Field({
  label,
  error,
  hint,
  className,
  ...input
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: ReactNode }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        id={id}
        className="field"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...input}
      />
      {error ? (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[13px] text-dust">{hint}</p>
      ) : null}
    </div>
  );
}

/** Russian phone with a live mask: "+7 916 123-45-67". */
export function PhoneField({
  value,
  onChange,
  error,
  label = "Телефон",
  className,
  name = "phone",
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  className?: string;
  name?: string;
}) {
  return (
    <Field
      label={label}
      name={name}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder="+7 900 000-00-00"
      value={value}
      onFocus={() => {
        if (!value) onChange("+7 ");
      }}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").length <= 1 ? e.target.value : phoneMask(e.target.value))}
      error={error}
      className={className}
    />
  );
}

/** Personal data consent: required by Russian law for any form with a name and phone. */
export function Consent({ checked, onChange, error }: { checked: boolean; onChange: (v: boolean) => void; error?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-[13.5px] leading-snug text-dust">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-5 w-5 flex-none cursor-pointer accent-[rgb(var(--pulse))]"
          aria-invalid={error ? true : undefined}
        />
        <span>
          Согласен на обработку персональных данных по{" "}
          <Link href="/privacy" className="text-chalk underline decoration-line/40 underline-offset-2 hover:decoration-chalk">
            политике клуба
          </Link>
        </span>
      </label>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

/** A red line for a form-level error. */
export function FormError({ children, className }: { children?: ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <p role="alert" className={clsx("rounded-xl border border-pulse/40 bg-pulse/10 px-4 py-3 text-[14.5px] text-chalk", className)}>
      {children}
    </p>
  );
}
