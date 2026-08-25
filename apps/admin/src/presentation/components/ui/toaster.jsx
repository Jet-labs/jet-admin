import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useToastStore } from "../../../utils/notification";

export const Toaster = () => {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          onClick={() => remove(toast.id)}
          className={`pointer-events-auto flex cursor-pointer items-start gap-2 rounded border p-2 text-sm shadow-lg ${
            toast.type === "success"
              ? "border-border/50 bg-background text-foreground"
              : "border-destructive/40 bg-background text-foreground"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          )}
          <span className="break-words">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};
