"use client"

import { useToast } from "./use-toast"
import { XCircle, CheckCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col items-end gap-2 p-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex w-full max-w-md items-center gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300",
            toast.visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
            toast.variant === "destructive"
              ? "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-50"
              : "border-gray-200 bg-white text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50",
          )}
        >
          {toast.variant === "destructive" ? (
            <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
          )}
          <div className="flex-1">
            <h3 className="font-medium">{toast.title}</h3>
            {toast.description && <p className="text-sm opacity-90">{toast.description}</p>}
          </div>
          <button
            className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => {
              document.dispatchEvent(new CustomEvent("toast-dismiss", { detail: { id: toast.id } }))
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      ))}
    </div>
  )
}

