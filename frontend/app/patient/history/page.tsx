"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/shared/DashboardShell"
import { 
  Calendar, 
  LayoutDashboard, 
  History, 
  UserCircle,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Brain,
  Search,
  ChevronRight,
  Activity
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/utils/supabase/client"

const navItems = [
  { label: "Overview", href: "/patient", icon: LayoutDashboard },
  { label: "Book Appointment", href: "/patient/book", icon: Calendar },
  { label: "Health Portal", href: "/patient/health", icon: Activity },
  { label: "Triage History", href: "/patient/history", icon: History },
  { label: "Profile", href: "/patient/profile", icon: UserCircle },
]

export default function TriageHistoryPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        fetch(`/api/appointments?patient_id=${data.user.id}`)
          .then(res => res.json())
          .then(data => {
            setAppointments(data.appointments || [])
            setLoading(false)
          })
      }
    })
  }, [supabase])

  const filteredAppointments = appointments.filter(a => 
    a.symptoms_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.doctor?.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.status?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />
      default: return <Clock className="h-4 w-4 text-slate-400" />
    }
  }

  return (
    <DashboardShell role="patient" navItems={navItems} userName={user?.user_metadata?.full_name}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Triage History</h1>
                <p className="text-slate-500 text-sm">Review your past consultations and AI risk assessments.</p>
            </div>
            <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Search history..." 
                    className="pl-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>

        <div className="grid gap-4">
            {loading ? (
                Array(3).fill(0).map((_, i) => (
                    <Card key={i} className="animate-pulse rounded-2xl border-none hospital-shadow">
                        <CardContent className="p-6 h-28 bg-slate-100 dark:bg-slate-800/50" />
                    </Card>
                ))
            ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                    <History className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No history found</h3>
                    <p className="text-slate-500 text-sm">You haven't booked any triage assessments yet.</p>
                    <Button variant="outline" className="mt-6 rounded-xl">Book Your First Assessment</Button>
                </div>
            ) : (
                filteredAppointments.map((appt) => (
                    <Card key={appt.id} className="rounded-2xl border-none hospital-shadow hover:shadow-md transition-shadow group overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row">
                                {/* Risk Sidebar Color */}
                                <div className={`w-1 md:w-2 ${
                                    appt.risk_level === 'High' ? 'bg-red-500' : 
                                    appt.risk_level === 'Medium' ? 'bg-amber-500' : 'bg-teal-500'
                                }`} />
                                
                                <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <FileText className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-bold text-slate-900 dark:text-white">
                                                    Consultation with {appt.doctor?.profiles?.full_name || 'Assigned Provider'}
                                                </p>
                                                <Badge variant="outline" className="text-[10px] uppercase font-bold px-2 py-0 border-slate-200">
                                                    {appt.doctor?.specialization || 'Clinical Staff'}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                                                <Calendar className="h-3 w-3" />
                                                {appt.created_at ? new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(appt.created_at)) : 'Recent'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-center md:text-right">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">AI Risk Level</p>
                                            <div className="flex items-center gap-1.5 md:justify-end">
                                                <Brain className={`h-3 w-3 ${
                                                    appt.risk_level === 'High' ? 'text-red-500' : 
                                                    appt.risk_level === 'Medium' ? 'text-amber-500' : 'text-teal-500'
                                                }`} />
                                                <span className={`text-sm font-black ${
                                                    appt.risk_level === 'High' ? 'text-red-600' : 
                                                    appt.risk_level === 'Medium' ? 'text-amber-600' : 'text-teal-600'
                                                }`}>
                                                    {appt.risk_level || 'Normal'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-center md:text-right">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Status</p>
                                            <div className="flex items-center gap-1.5 md:justify-end">
                                                {getStatusIcon(appt.status)}
                                                <span className="text-sm font-bold capitalize">{appt.status}</span>
                                            </div>
                                        </div>

                                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-50 group-hover:translate-x-1 transition-transform">
                                            <ChevronRight className="h-5 w-5 text-slate-400" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
      </div>
    </DashboardShell>
  )
}
