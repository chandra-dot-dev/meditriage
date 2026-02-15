"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { DashboardShell } from "@/components/shared/DashboardShell"
import { 
  Users, 
  TrendingUp, 
  Activity, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Award,
  Brain,
  Calendar,
  MessageSquare,
  ChevronRight,
  Filter,
  Download
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

const navItems = [
  { label: "Patient Queue", href: "/doctor", icon: Users },
  { label: "My Appointments", href: "/doctor/appointments", icon: Clock },
  { label: "Clinical Notes", href: "/doctor/notes", icon: MessageSquare },
  { label: "Statistics", href: "/doctor/stats", icon: TrendingUp },
]

export default function DoctorStatsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    // Simulate loading for rich UI feel
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [supabase])

  const kpis = [
    { label: "Total Patients", value: "1,482", trend: "+12%", up: true, icon: Users, color: "blue" },
    { label: "Avg. Consult Time", value: "18.5m", trend: "-5%", up: false, icon: Clock, color: "emerald" },
    { label: "Risk Detection", value: "99.2%", trend: "+0.4%", up: true, icon: Brain, color: "indigo" },
    { label: "Patient Satisfaction", value: "4.9/5", trend: "+2%", up: true, icon: Award, color: "amber" },
  ]

  return (
    <DashboardShell role="doctor" navItems={navItems} userName={user?.user_metadata?.full_name}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Clinical Performance Analytics</h1>
                <p className="text-slate-500 text-sm max-w-lg">
                    Comprehensive overview of your triage throughput, patient outcomes, and clinical efficiency.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-800 font-bold px-6">
                    <Filter className="h-4 w-4 mr-2" /> Weekly View
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6 shadow-lg shadow-blue-500/20">
                    <Download className="h-4 w-4 mr-2" /> Export PDF Report
                </Button>
            </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, i) => (
                <Card key={i} className="rounded-[2rem] border-none hospital-shadow group hover:translate-y-[-4px] transition-all overflow-hidden relative">
                    <CardContent className="p-6">
                        <div className={`h-12 w-12 bg-${kpi.color}-50 dark:bg-${kpi.color}-900/20 rounded-2xl flex items-center justify-center mb-6`}>
                            <kpi.icon className={`h-6 w-6 text-${kpi.color}-600 dark:text-${kpi.color}-400`} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{kpi.label}</p>
                        <div className="flex items-end gap-3">
                            <p className="text-3xl font-black">{kpi.value}</p>
                            <div className={`flex items-center text-[10px] font-bold mb-1.5 ${kpi.up ? 'text-emerald-500' : 'text-red-500'}`}>
                                {kpi.up ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                                {kpi.trend}
                            </div>
                        </div>
                    </CardContent>
                    <div className={`absolute bottom-0 left-0 h-1 w-full bg-${kpi.color}-500/20`} />
                </Card>
            ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
            {/* Triage Risk Distribution Chart Placeholder */}
            <Card className="lg:col-span-8 rounded-[2.5rem] border-none hospital-shadow overflow-hidden flex flex-col">
                <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold">Triage Distribution</CardTitle>
                            <CardDescription className="text-xs">Patient risk levels assessed over selected period</CardDescription>
                        </div>
                        <div className="flex gap-2">
                             {['High', 'Med', 'Low'].map(l => (
                                <div key={l} className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-800 text-[10px] font-bold opacity-70">
                                    <div className={`h-1.5 w-1.5 rounded-full ${l === 'High' ? 'bg-red-500' : l === 'Med' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                    {l}
                                </div>
                             ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-8 flex items-end justify-between gap-4 min-h-[300px]">
                    {[40, 60, 25, 80, 45, 90, 55, 70, 30, 85].map((height, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                             <div className="w-full relative px-2">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    className={`w-full rounded-t-xl transition-all group-hover:opacity-80 ${i % 3 === 0 ? 'bg-red-500' : i % 3 === 1 ? 'bg-amber-500' : 'bg-emerald-500'} hospital-shadow`}
                                />
                             </div>
                             <span className="text-[9px] font-black text-slate-400 rotate-[-45deg] whitespace-nowrap">Day {i+1}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="lg:col-span-4 space-y-8">
                <Card className="rounded-[2.5rem] border-none hospital-shadow p-8 bg-slate-900 text-white relative overflow-hidden flex flex-col h-full">
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 bg-blue-500/20 rounded-full blur-3xl" />
                    <div className="relative z-10 flex-col h-full flex">
                        <h3 className="text-xl font-black mb-1">Efficiency Goal</h3>
                        <p className="text-xs text-slate-400 mb-8 font-medium">Your progress towards weekly documentation completion.</p>
                        
                        <div className="flex-1 flex flex-col justify-center items-center gap-6 py-4">
                            <div className="relative h-32 w-32">
                                <svg className="h-full w-full" viewBox="0 0 36 36">
                                    <path className="text-white/10" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path className="text-blue-500" strokeDasharray="85, 100" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black">85%</span>
                                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">Completed</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold truncate">24/28 Cases Finalized</p>
                                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black">Next audit in 2 days</p>
                            </div>
                        </div>

                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black h-12 gap-2 mt-auto">
                           Review Pending <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </Card>
            </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {[
                { title: "Weekly Load", val: "+14%", desc: "Consultation volume is increasing", icon: Activity, color: "blue" },
                { title: "Review Speed", val: "1.2m", desc: "Decreased documentation lag time", icon: TrendingUp, color: "emerald" },
                { title: "AI Precision", val: "94%", desc: "Agreement rate with ML models", icon: Brain, color: "indigo" }
            ].map((box, i) => (
                <Card key={i} className="rounded-[2.2rem] border-none hospital-shadow p-6 flex flex-col gap-4 group">
                    <div className="flex items-center gap-4">
                         <div className={`h-10 w-10 bg-${box.color}-50 dark:bg-${box.color}-900/20 rounded-xl flex items-center justify-center`}>
                            <box.icon className={`h-5 w-5 text-${box.color}-600 dark:text-${box.color}-400 group-hover:scale-110 transition-transform`} />
                         </div>
                         <div>
                            <h4 className="text-sm font-black tracking-tight">{box.title}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{box.val}</p>
                         </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{box.desc}</p>
                </Card>
            ))}
        </div>
      </div>
    </DashboardShell>
  )
}
