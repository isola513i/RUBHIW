"use client";

import Link from "next/link";
import toast, { type Toast } from "react-hot-toast";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type AppToastVariant = "success" | "error";

type AppToastOptions = {
  action?: {
    href: string;
    label: string;
  };
  duration?: number;
  message: string;
  variant?: AppToastVariant;
};

export function showAppToast({ action, duration = 2600, message, variant = "success" }: AppToastOptions) {
  toast.custom((toastInstance) => <AppToast action={action} message={message} toastInstance={toastInstance} variant={variant} />, {
    duration,
  });
}

function AppToast({
  action,
  message,
  toastInstance,
  variant,
}: {
  action?: AppToastOptions["action"];
  message: string;
  toastInstance: Toast;
  variant: AppToastVariant;
}) {
  const Icon = variant === "success" ? CheckCircle2 : AlertCircle;
  const tone =
    variant === "success"
      ? "border-[#BBD8C2] bg-[#E8F3EA] text-[#2C4C3B]"
      : "border-[#E5B7AE] bg-[#F7E8E4] text-[#713C35]";

  return (
    <div
      className={`mx-auto flex min-h-12 max-w-[calc(100vw-2rem)] items-center gap-3 rounded-[18px] border px-3.5 py-2.5 text-[14px] font-semibold shadow-[0_18px_42px_rgba(74,67,59,0.14)] transition duration-200 ease-[var(--ease-out-ui)] sm:max-w-sm ${tone} ${
        toastInstance.visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={2.4} />
      <span className="min-w-0 flex-1 leading-5">{message}</span>
      {action ? (
        <Link
          className="shrink-0 rounded-full bg-[#2C312E] px-3.5 py-2 text-xs font-semibold text-[#FDFBF7] transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.96]"
          href={action.href}
          onClick={() => toast.dismiss(toastInstance.id)}
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
