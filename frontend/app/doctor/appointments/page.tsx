"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { DashboardShell } from "@/components/shared/DashboardShell"
import { 
  Users, 
  Activity, 
  Clock, 
  Search,
  Calendar,
  Filter,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  MoreVertical,
  ChevronRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

const navItems = [
  { label: "Patient Queue", href: "/doctor", icon: Users },
  { label: "My Appointments", href: "/doctor/appointments", icon: Clock },
  { label: "Clinical Notes", href: "/doctor/notes", icon: MessageSquare },
  { label: "Statistics", href: "/doctor/stats", icon: TrendingUp },
]

export default function DoctorAppointmentsPage() {
  const [user, setUser] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
        setUser(data.user)
        if (data.user) {
            fetchMyAppointments(data.user.id)
        }
    })
  }, [supabase])

  const fetchMyAppointments = async (doctorId: string) => {
    try {
      const res = await fetch(`/api/appointments?doctor_id=${doctorId}`)
      const data = await res.json()
      setAppointments(data.appointments || [])
    } catch (err) {
      console.error("Failed to fetch my appointments")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100 uppercase text-[9px] font-bold">Scheduled</Badge>
      case 'in_progress': return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 uppercase text-[9px] font-bold animate-pulse">In Room</Badge>
      case 'completed': return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 uppercase text-[9px] font-bold">Closed</Badge>
      default: return <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-100 uppercase text-[9px] font-bold">{status}</Badge>
    }
  }

  return (
    <DashboardShell role="doctor" navItems={navItems} userName={user?.user_metadata?.full_name}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">My Appointments</h1>
                <p className="text-slate-500 text-sm max-w-lg">
                    Manage your assigned schedule and upcoming clinical consultations.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6 shadow-lg shadow-blue-500/20">
                    <Calendar className="h-4 w-4 mr-2" /> View Full Calendar
                </Button>
            </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
                <Card className="rounded-[2rem] border-none hospital-shadow overflow-hidden">
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            <CardTitle className="text-lg font-bold">Upcoming Schedule</CardTitle>
                         </div>
                         <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg outline-none">
                                <Filter className="h-4 w-4 text-slate-400" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg outline-none">
                                <Search className="h-4 w-4 text-slate-400" />
                            </Button>
                         </div>
                    </div>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {loading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="px-8 py-6 animate-pulse flex items-center gap-6">
                                        <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
                                            <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800 rounded" />
                                        </div>
                                    </div>
                                ))
                            ) : appointments.length === 0 ? (
                                <div className="p-20 text-center">
                                    <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <Calendar className="h-8 w-8" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-400">No appointments scheduled for today.</p>
                                </div>
                            ) : appointments.map((appointment, i) => (
                                <motion.div 
                                    key={appointment.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="px-8 py-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-center justify-center w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl text-center group-hover:scale-105 transition-transform">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Feb</span>
                                            <span className="text-xl font-black text-slate-700 dark:text-slate-200 leading-none">15</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-sm tracking-tight">{appointment.patient?.full_name || 'Anonymous Patient'}</h3>
                                                {getStatusBadge(appointment.status)}
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 10:30 AM</span>
                                                <span className="h-1 w-1 bg-slate-300 rounded-full" />
                                                <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> General Medicine</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Clinical Note</p>
                                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                                                {appointment.notes || 'No active notes...'}
                                            </p>
                                        </div>
                                        <Link href={`/doctor/patient/${appointment.id}`}>
                                            <Button variant="ghost" className="rounded-xl font-bold text-xs h-10 px-4 group-hover:bg-blue-600 group-hover:text-white transition-all gap-2">
                                                Open Record <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-4 space-y-6">
                <Card className="rounded-[2.2rem] border-none hospital-shadow bg-slate-900 text-white p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 bg-blue-500/20 rounded-full blur-3xl opacity-50" />
                    <h3 className="text-lg font-bold mb-2 relative z-10">Daily Summary</h3>
                    <p className="text-slate-400 text-xs mb-8 relative z-10">Your clinical stats for the current shift.</p>
                    
                    <div className="space-y-6 relative z-10">
                        <div className="flex justify-between items-end border-b border-white/5 pb-4">
                            <div>
                                <p className="text-2xl font-black">08</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1">Total Scheduled</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-emerald-400">{appointments.filter(a => a.status === 'completed').length}</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1">Completed</p>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                <span>Shift Progress</span>
                                <span className="text-blue-400">75%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[75%] rounded-full" />
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="rounded-[2.2rem] border-none hospital-shadow p-6">
                    <CardHeader className="p-2 mb-4">
                        <CardTitle className="text-sm font-bold">Priority Patient</CardTitle>
                    </CardHeader>
                    {appointments.find(a => a.risk_level === 'High') ? (
                        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-800">
                             <div className="flex items-center gap-3 mb-3">
                                <div className="h-8 w-8 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold text-xs uppercase">
                                    {appointments.find(a => a.risk_level === 'High').patient?.full_name?.[0]}
                                </div>
                                <p className="text-sm font-bold truncate">{appointments.find(a => a.risk_level === 'High').patient?.full_name}</p>
                             </div>
                             <p className="text-[10px] text-red-600 font-bold uppercase mb-4 tracking-widest">Critical Assessment Recommended</p>
                             <Button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold h-10 text-xs gap-2">
                                Start Consultation <ArrowRight className="h-3 w-3" />
                             </Button>
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                             <p className="text-[10px] font-bold text-slate-400 uppercase">No urgent cases</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
      </div>
    </DashboardShell>
  )
}
