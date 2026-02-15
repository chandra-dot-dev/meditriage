"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { DashboardShell } from "@/components/shared/DashboardShell"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Calendar, 
  ClipboardList, 
  History, 
  UserCircle,
  Stethoscope,
  Activity,
  Clock,
  ArrowRight,
  Plus
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

const navItems = [
  { label: "Overview", href: "/patient", icon: LayoutDashboard },
  { label: "Book Appointment", href: "/patient/book", icon: Calendar },
  { label: "Health Portal", href: "/patient/health", icon: Activity },
  { label: "Triage History", href: "/patient/history", icon: History },
  { label: "Profile", href: "/patient/profile", icon: UserCircle },
]

export default function PatientDashboard() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [supabase])

  const stats = [
    { label: "Queue Position", value: "3rd", sub: "Est. 12 mins", icon: Clock, color: "teal" },
    { label: "Triage Status", value: "Normal", sub: "Assessed today", icon: Activity, color: "blue" },
    { label: "Appointments", value: "2", sub: "Next at 2:00 PM", icon: Calendar, color: "indigo" },
  ]

  return (
    <DashboardShell 
      role="patient" 
      navItems={navItems} 
      userName={user?.user_metadata?.full_name}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 hospital-shadow">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
              Good Morning, <span className="text-teal-600 dark:text-teal-400">{user?.user_metadata?.full_name?.split(' ')[0] || 'Patient'}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">
              Welcome to your MediTriage health portal. You are currently 3rd in line for Dr. Miller.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/patient/book">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-6 py-6 h-auto font-bold gap-2 transition-all hover:scale-105">
                <Plus className="h-5 w-5" /> New Triage Case
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl hospital-shadow relative overflow-hidden group transition-all"
            >
              <div className={`absolute top-0 right-0 h-24 w-24 -mr-8 -mt-8 bg-${stat.color}-500/5 dark:bg-${stat.color}-400/5 rounded-full blur-2xl group-hover:scale-150 transition-transform`} />
              <div className="flex items-start justify-between mb-4">
                <div className={`h-10 w-10 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-extrabold mb-1">{stat.value}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-500 flex items-center gap-1">
                  {stat.sub}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Active Queue Info */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="rounded-2xl border-none hospital-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50 dark:border-slate-800/50 mb-4 px-6">
                <div>
                  <CardTitle className="text-lg font-bold">Active Consultations</CardTitle>
                  <CardDescription className="text-xs">Live updates from the clinic</CardDescription>
                </div>
                <Badge variant="outline" className="bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-800 animate-pulse">
                  Live Queue
                </Badge>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-dashed border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center hospital-shadow">
                      <Stethoscope className="h-7 w-7 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Consultation with Dr. Emily Miller</p>
                      <p className="text-xs text-slate-500">General Medicine · Clinical Assessment</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs mb-2">
                        <span className="font-bold">Queue Progress</span>
                        <span className="text-teal-600 dark:text-teal-400 font-bold">75% Complete</span>
                    </div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "75%" }}
                        className="h-full bg-teal-500 rounded-full"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                       <p className="text-[10px] text-slate-400 italic">Dr. Miller is currently seeing Patient #112. Expected start time for you is 10:45 AM.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="rounded-2xl border-none hospital-shadow group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center justify-between">
                            Health Summary
                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">Last Risk Assessment</span>
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Low Risk</Badge>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">Blood Pressure</span>
                                <span className="font-semibold">120/80 mmHg</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">Heart Rate</span>
                                <span className="font-semibold">72 bpm</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-none hospital-shadow group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center justify-between">
                            Recent Activity
                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="h-2 w-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                                <div>
                                    <p className="text-[11px] font-bold">Appointment Scheduled</p>
                                    <p className="text-[10px] text-slate-400">Tomorrow at 2:00 PM</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700 mt-1.5 shrink-0" />
                                <div>
                                    <p className="text-[11px] font-bold">Triage Results Published</p>
                                    <p className="text-[10px] text-slate-400">Oct 12, 2026</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-2xl border-none bg-teal-600 dark:bg-teal-600 text-white hospital-shadow overflow-hidden relative">
              <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/3 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">Emergency?</CardTitle>
                <CardDescription className="text-teal-100 text-xs">If you are in immediate danger, please call emergency services.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-white text-teal-600 hover:bg-teal-50 rounded-xl font-bold py-6 h-auto transition-transform hover:scale-105">
                  Call Hospital Direct
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none hospital-shadow">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Knowledge Base</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "Understanding Triage Risk",
                  "When to see a Doctor",
                  "Managing Post-Care Results",
                  "Guide to Emergency Room"
                ].map((item, i) => (
                  <button key={i} className="w-full text-left text-[11px] py-1.5 text-slate-500 dark:text-slate-400 hover:text-teal-600 transition-colors flex items-center gap-2">
                    <ClipboardList className="h-3 w-3" />
                    {item}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
