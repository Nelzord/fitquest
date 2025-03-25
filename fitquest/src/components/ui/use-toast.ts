"use client"

import { useState, useEffect } from "react"

type ToastProps = {
  title: string
  description?: string
  duration?: number
  variant?: "default" | "destructive"
}

type ToastState = ToastProps & {
  id: string
  visible: boolean
}

// Simple toast implementation
export function toast(props: ToastProps) {
  const event = new CustomEvent("toast", {
    detail: {
      ...props,
      id: Math.random().toString(36).substring(2, 9),
    },
  })

  window.dispatchEvent(event)
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([])

  useEffect(() => {
    const handleToast = (event: Event) => {
      const toast = (event as CustomEvent<ToastProps & { id: string }>).detail

      setToasts((prev) => [...prev, { ...toast, visible: true }])

      // Auto dismiss
      setTimeout(() => {
        setToasts((prev) => prev.map((t) => (t.id === toast.id ? { ...t, visible: false } : t)))

        // Remove from DOM after animation
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toast.id))
        }, 300)
      }, toast.duration || 3000)
    }

    window.addEventListener("toast", handleToast)

    return () => {
      window.removeEventListener("toast", handleToast)
    }
  }, [])

  return { toasts }
}

