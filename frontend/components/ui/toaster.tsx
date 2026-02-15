"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from "lucide-react"

export type ToastType = "info" | "success" | "warning" | "error" | "emergency"

export interface Toast {
  id: string
  title: string
  description?: string
  type?: ToastType
}

interface ToastContextType {
  toasts: Toast[]
  toast: (payload: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = React.useCallback(({ title, description, type = "info" }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, title, description, type }])
    setTimeout(() => dismiss(id), 5000)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`p-4 rounded-2xl shadow-2xl border flex gap-3 items-start relative overflow-hidden ${
                t.type === "emergency" ? "bg-red-600 text-white border-red-500" :
                t.type === "error" ? "bg-white dark:bg-slate-900 border-red-100 dark:border-red-900/30" :
                t.type === "success" ? "bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-900/30" :
                "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
              }`}
            >
                {t.type === "emergency" && (
                     <motion.div 
                        animate={{ opacity: [0.1, 0.3, 0.1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-white"
                     />
                )}
              
              <div className="relative z-10">
                {t.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                {t.type === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
                {t.type === "emergency" && <AlertTriangle className="h-5 w-5 text-white animate-bounce" />}
                {t.type === "warning" && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                {t.type === "info" && <Info className="h-5 w-5 text-blue-500" />}
              </div>

              <div className="relative z-10 flex-1">
                <p className={`text-sm font-bold ${t.type === "emergency" ? "text-white" : "text-slate-900 dark:text-slate-100"}`}>
                  {t.title}
                </p>
                {t.description && (
                  <p className={`text-xs mt-1 ${t.type === "emergency" ? "text-red-100" : "text-slate-500 dark:text-slate-400"}`}>
                    {t.description}
                  </p>
                )}
              </div>

              <button 
                onClick={() => dismiss(t.id)}
                className="relative z-10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within ToastProvider")
  return context
}
