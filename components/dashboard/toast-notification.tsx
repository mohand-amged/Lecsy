import { Check, X, Sparkles } from "lucide-react"

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
}

interface ToastNotificationProps {
  toasts: Toast[]
}

export function ToastNotification({ toasts }: ToastNotificationProps) {
  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 space-y-2 max-w-[calc(100vw-2rem)] md:max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-3 py-2 md:px-4 md:py-3 rounded-xl shadow-2xl backdrop-blur-xl border animate-slide-in-right ${
            toast.type === "success"
              ? "bg-green-500/10 border-green-500/30 text-green-500"
              : toast.type === "error"
                ? "bg-destructive/10 border-destructive/30 text-destructive"
                : "bg-primary/10 border-primary/30 text-primary"
          }`}
        >
          <div className="flex items-center gap-2 md:gap-3">
            {toast.type === "success" && <Check className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />}
            {toast.type === "error" && <X className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />}
            {toast.type === "info" && <Sparkles className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />}
            <span className="font-medium text-sm md:text-base">{toast.message}</span>
          </div>
        </div>
      ))}
    </div>
  )
}