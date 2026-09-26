"use client";

import { useState, type ReactNode } from "react";
import clsx from "clsx";
import { CheckCircle2 } from "lucide-react";
import { usePulse } from "@/components/pulse/PulseProvider";
import type { LeadKind } from "@/lib/session-types";
import { Consent, Field, FormError, PhoneField } from "./Form";

type Extra = "email" | "company" | "comment" | "goal";

type Props = {
  kind: LeadKind;
  /** Extra fields besides name and phone */
  fields?: Extra[];
  /** Options for the goal select, [value, label] */
  goals?: [string, string][];
  /** Membership plan slug or any fixed context sent with the request */
  plan?: string;
  /** JSON string attached to the lead (e.g. a program) */
  program?: string;
  /** Attach the visitor's pulse and age when they measured it */
  attachPulse?: boolean;
  submitLabel?: string;
  commentLabel?: string;
  commentPlaceholder?: string;
  companyLabel?: string;
  successTitle?: string;
  successText?: ReactNode;
  className?: string;
};

/** Any request to the club: trial, corporate, kids, membership, callback, personal training. Posts to /api/leads. */
export function LeadForm({
  kind,
  fields = ["comment"],
  goals,
  plan,
  program,
  attachPulse = false,
  submitLabel = "Отправить заявку",
  commentLabel = "Комментарий",
  commentPlaceholder = "Удобное время для звонка, вопросы",
  companyLabel = "Компания",
  successTitle = "Заявка у нас",
  successText = "Администратор перезвонит в течение часа в рабочее время клуба.",
  className,
}: Props) {
  const pulse = usePulse();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [goal, setGoal] = useState(goals?.[0]?.[0] ?? "");
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setFormError(null);
    setErrors({});
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind,
          name,
          phone,
          email: fields.includes("email") ? email : undefined,
          company: fields.includes("company") ? company : undefined,
          goal: fields.includes("goal") ? goal : undefined,
          comment: fields.includes("comment") ? comment : undefined,
          plan,
          program,
          age: attachPulse && pulse.measured ? pulse.age : undefined,
          restingHr: attachPulse && pulse.measured ? pulse.rest : undefined,
          consent,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(data.fields ?? {});
        setFormError(data.error ?? "Не получилось отправить. Попробуйте ещё раз.");
        return;
      }
      setDone(true);
    } catch {
      setFormError("Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className={clsx("card flex flex-col items-start gap-3 p-6", className)} role="status">
        <CheckCircle2 className="h-8 w-8 text-pulse" aria-hidden />
        <p className="display text-d-4 stretch-normal">{successTitle}</p>
        <p className="text-dust">{successText}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className={clsx("grid gap-4", className)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Имя" name="name" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        <PhoneField value={phone} onChange={setPhone} error={errors.phone} />
      </div>
      {fields.includes("company") && <Field label={companyLabel} name="company" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} error={errors.company} />}
      {fields.includes("email") && <Field label="Почта" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />}
      {fields.includes("goal") && goals && (
        <div>
          <label htmlFor={`goal-${kind}`} className="field-label">
            Цель
          </label>
          <select id={`goal-${kind}`} className="field" value={goal} onChange={(e) => setGoal(e.target.value)}>
            {goals.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}
      {fields.includes("comment") && (
        <div>
          <label htmlFor={`comment-${kind}`} className="field-label">
            {commentLabel}
          </label>
          <textarea
            id={`comment-${kind}`}
            className="field min-h-[110px] resize-y"
            placeholder={commentPlaceholder}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            aria-invalid={errors.comment ? true : undefined}
          />
          {errors.comment && <p className="field-error">{errors.comment}</p>}
        </div>
      )}
      {attachPulse && pulse.measured && (
        <p className="text-[13.5px] text-dust">
          К заявке приложим ваш пульс покоя <span className="digits text-[18px] text-chalk">{pulse.rest}</span> и возраст{" "}
          <span className="digits text-[18px] text-chalk">{pulse.age}</span>: тренер подготовится заранее.
        </p>
      )}
      <Consent checked={consent} onChange={setConsent} error={errors.consent} />
      <FormError>{formError}</FormError>
      <button type="submit" className="btn-primary w-full sm:w-auto" disabled={sending}>
        {sending ? "Отправляем…" : submitLabel}
      </button>
    </form>
  );
}
