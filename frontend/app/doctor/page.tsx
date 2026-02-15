"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { DashboardShell } from "@/components/shared/DashboardShell"
import { 
  Users, 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search,
  Users2,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Brain,
  MessageSquare
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import Link from "next/link"

const navItems = [
  { label: "Patient Queue", href: "/doctor", icon: Users },
  { label: "My Appointments", href: "/doctor/appointments", icon: Clock },
  { label: "Clinical Notes", href: "/doctor/notes", icon: MessageSquare },
  { label: "Statistics", href: "/doctor/stats", icon: TrendingUp },
]

import { useToast } from "@/components/ui/toaster"

export default function DoctorDashboard() {
  const [user, setUser] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments')
      const data = await res.json()
      setAppointments(data.appointments || [])
    } catch (err) {
      console.error("Failed to fetch appointments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    fetchAppointments()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('doctor_queue')
      .on('postgres_changes', { 
        event: 'INSERT', 
        table: 'appointments', 
        schema: 'public' 
      }, (payload) => {
        fetchAppointments()
        
        // Notify doctor of new high-risk patient
        if (payload.new.risk_level === 'High') {
          toast({
            title: "URGENT TRIAGE",
            description: `New High-Risk case detected. Immediate assessment requested.`,
            type: "emergency"
          })
        }
      })
      .on('postgres_changes', { event: '*', table: 'appointments', schema: 'public' }, () => {
        fetchAppointments()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, toast])

  const stats = [
    { label: "Pending Triage", value: appointments.length.toString(), sub: "+2 since last hour", icon: Clock, color: "blue" },
    { label: "High Risk Cases", value: appointments.filter(a => (a.risk_level || a.priority) === 'High').length.toString(), sub: "Requires immediate attention", icon: AlertTriangle, color: "red" },
    { label: "Consultations", value: "12", sub: "Completed today", icon: CheckCircle2, color: "emerald" },
  ]

  return (
    <DashboardShell 
      role="doctor" 
      navItems={navItems} 
      userName={user?.user_metadata?.full_name}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Clinical Dashboard</h1>
                <p className="text-slate-500 text-sm max-w-lg underline decoration-blue-500/20 underline-offset-4">
                    Manage your clinical queue and review AI-powered risk assessments in real-time.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-800 font-bold px-6">
                    <Filter className="h-4 w-4 mr-2" /> Filter Queue
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6 shadow-lg shadow-blue-500/20">
                    Next Patient <ArrowUpRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="rounded-2xl border-none hospital-shadow overflow-hidden group">
              <CardContent className="p-6 relative">
                 <div className={`absolute top-0 right-0 h-24 w-24 -mr-8 -mt-8 bg-${stat.color}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform`} />
                 <div className="flex items-center gap-4 mb-4">
                    <div className={`h-12 w-12 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-xl flex items-center justify-center`}>
                        <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
                        <p className="text-2xl font-black">{stat.value}</p>
                    </div>
                 </div>
                 <p className="text-[10px] text-slate-500 font-medium">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Live Queue Container */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 hospital-shadow overflow-hidden">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
                        <Users2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold">Patient Queue</CardTitle>
                        <CardDescription className="text-xs">Prioritized by AI Risk Score</CardDescription>
                    </div>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search patients..." className="pl-10 h-10 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs" />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <tr>
                            <th className="px-8 py-4">Patient Name</th>
                            <th className="px-6 py-4 text-center">Triage Risk</th>
                            <th className="px-6 py-4">Primary Symptoms</th>
                            <th className="px-6 py-4">Wait Time</th>
                            <th className="px-6 py-4">AI Score</th>
                            <th className="px-8 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-8 py-6"><div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded" /></td>
                                    <td className="px-6 py-6"><div className="mx-auto h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" /></td>
                                    <td className="px-6 py-6"><div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 rounded" /></td>
                                    <td className="px-6 py-6"><div className="h-4 w-12 bg-slate-100 dark:bg-slate-800 rounded" /></td>
                                    <td className="px-8 py-6 text-right"><div className="ml-auto h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-xl" /></td>
                                </tr>
                            ))
                        ) : appointments.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-8 py-20 text-center text-slate-400 italic text-sm">
                                    No patients in the queue.
                                </td>
                            </tr>
                        ) : appointments.map((appointment) => (
                            <tr key={appointment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 group-hover:scale-110 transition-transform">
                                            {appointment.patient?.full_name?.[0] || 'P'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm tracking-tight">{appointment.patient?.full_name || 'Anonymous'}</p>
                                            <p className="text-[10px] text-slate-500">{appointment.patient?.email || 'No email'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6 text-center">
                                    <Badge className={`rounded-full px-3 font-bold text-[9px] uppercase border-2 shadow-sm ${
                                        (appointment.risk_level || appointment.priority) === 'High' ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' :
                                        (appointment.risk_level || appointment.priority) === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    }`}>
                                        {(appointment.risk_level || appointment.priority) || 'Unknown'}
                                    </Badge>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                        {Array.isArray(appointment.symptoms) && appointment.symptoms.slice(0, 2).map((s: string) => (
                                            <span key={s} className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                {s}
                                            </span>
                                        ))}
                                        {Array.isArray(appointment.symptoms) && appointment.symptoms.length > 2 && (
                                            <span className="text-[9px] text-slate-400">+{appointment.symptoms.length - 2}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">12m</p>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-2">
                                        <Brain className="h-3 w-3 text-blue-500" />
                                        <span className="text-xs font-black text-blue-600 dark:text-blue-400">92%</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <Link href={`/doctor/patient/${appointment.id}`}>
                                        <Button className="bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs h-9 px-4 transition-all border-none">
                                            Review Detail
                                        </Button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Secondary Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="rounded-[2rem] border-none hospital-shadow">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Priority Alerts</CardTitle>
                    <CardDescription className="text-xs mb-2">Systems requiring immediate staff review</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-800 flex gap-4">
                        <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-red-700 dark:text-red-400 underline underline-offset-4 decoration-2">Immediate Review: John Smith</p>
                            <p className="text-xs text-red-600/80 mt-1">Symptom pattern suggests potential cardiovascular distress. Triage score increased to 98%.</p>
                        </div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 flex gap-4">
                        <Activity className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-blue-700 dark:text-blue-400">Stable Flow: General Medicine</p>
                            <p className="text-xs text-blue-600/80 mt-1">Wait times are within normal parameters (15-20 mins). Staff capacity at 80%.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-none hospital-shadow bg-blue-600 dark:bg-blue-700 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Shift Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <p className="text-2xl font-black">94%</p>
                                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Throughput Efficiency</p>
                            </div>
                            <TrendingUp className="h-8 w-8 opacity-20" />
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: "94%" }}
                                className="h-full bg-white rounded-full"
                            />
                        </div>
                        <p className="text-xs opacity-90 leading-relaxed font-medium capitalize">
                            You've seen 14 patients today, averaging 18 minutes per consultation. Your documentation completion rate is 100%.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
