"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Stethoscope, 
  Menu, 
  X, 
  LogOut, 
  User, 
  Bell,
  Search,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { signOut } from "@/app/login/actions"
import { useState } from "react"

interface NavItem {
  label: string
  href: string
  icon: any
}

interface DashboardShellProps {
  children: React.ReactNode
  navItems: NavItem[]
  role: 'patient' | 'doctor' | 'admin'
  userName?: string
}

export function DashboardShell({ children, navItems, role, userName }: DashboardShellProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const roleColors = {
    patient: 'teal',
    doctor: 'blue',
    admin: 'indigo'
  }

  const activeColor = roleColors[role]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3">
          <div className={`h-8 w-8 bg-${activeColor}-600 rounded-lg flex items-center justify-center`}>
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">MediTriage</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                  isActive 
                    ? `bg-${activeColor}-50 dark:bg-${activeColor}-900/10 text-${activeColor}-600 dark:text-${activeColor}-400` 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}>
                  <item.icon className={`h-5 w-5 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`} />
                  <span className="text-sm font-semibold">{item.label}</span>
                  {isActive && (
                    <motion.div layoutId="activeNav" className={`ml-auto h-1.5 w-1.5 rounded-full bg-${activeColor}-600 dark:bg-${activeColor}-400`} />
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className={`h-8 w-8 rounded-full bg-${activeColor}-100 dark:bg-${activeColor}-900/30 flex items-center justify-center text-${activeColor}-600 dark:text-${activeColor}-400 font-bold text-xs uppercase`}>
              {userName?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{userName || 'User'}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{role}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 gap-3 rounded-xl py-5"
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-semibold">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden md:flex flex-1 max-w-md relative mx-4 lg:mx-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search records, doctors, or results..." 
              className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <Button variant="ghost" size="icon" className="relative rounded-xl border border-slate-200 dark:border-slate-800">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950" />
            </Button>
            <ThemeToggle />
            <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center lg:hidden">
              <User className="h-4 w-4 text-slate-500" />
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-72 h-full bg-white dark:bg-slate-950 p-6 flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 bg-${activeColor}-600 rounded-lg flex items-center justify-center`}>
                    <Stethoscope className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-xl tracking-tight">MediTriage</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={`flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${
                        isActive ? `bg-${activeColor}-600 text-white shadow-lg shadow-${activeColor}-500/30` : 'text-slate-500'
                      }`}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-500 gap-4"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
