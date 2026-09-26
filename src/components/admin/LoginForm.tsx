"use client";

import { useActionState, useId } from "react";
import { login, type ActionState } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(login, null);
  const id = useId();
  return (
    <form action={action} className="grid gap-4">
      <div>
        <label htmlFor={id} className="field-label">
          Пароль
        </label>
        <input
          id={id}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          className="field"
          aria-invalid={state?.error ? true : undefined}
          aria-describedby={state?.error ? `${id}-error` : undefined}
        />
        <p id={`${id}-error`} className="field-error min-h-[1.4em]" role="alert" aria-live="assertive">
          {state?.error ?? ""}
        </p>
      </div>
      <button type="submit" disabled={pending} className="btn-primary w-full disabled:cursor-wait disabled:opacity-60">
        {pending ? "Проверяем…" : "Войти"}
      </button>
    </form>
  );
}
