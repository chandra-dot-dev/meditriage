"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { DashboardShell } from "@/components/shared/DashboardShell"
import { 
  Users, 
  Activity, 
  Clock, 
  MessageSquare, 
  TrendingUp,
  ArrowLeft,
  Brain,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Save,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [
  { label: "Patient Queue", href: "/doctor", icon: Users },
  { label: "My Appointments", href: "/doctor/appointments", icon: Clock },
  { label: "Clinical Notes", href: "/doctor/notes", icon: MessageSquare },
  { label: "Statistics", href: "/doctor/stats", icon: TrendingUp },
]

export default function DoctorPatientDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [appointment, setAppointment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState("")
  const supabase = createClient()

  useEffect(() => {
    fetch(`/api/appointments?id=${id}`).then(res => res.json()).then(data => {
      // Find the specific appointment if the API returns a list
      const appt = Array.isArray(data.appointments) ? data.appointments.find((a: any) => a.id === id) : data
      setAppointment(appt)
      setNotes(appt?.notes || "")
      setLoading(false)
    })
  }, [id])

  const handleCloseConsultation = async (status: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, notes })
      })
      if (res.ok) {
        router.push('/doctor?message=Consultation+Closed')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
    </div>
  )

  if (!appointment) return (
    <div className="p-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Queue
        </Button>
        <p>Appointment not found.</p>
    </div>
  )

  return (
    <DashboardShell role="doctor" navItems={navItems} userName="Dr. Miller">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-white dark:hover:bg-slate-900 rounded-xl px-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Patient Queue
        </Button>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Patient Info & AI Results */}
            <div className="lg:col-span-8 space-y-6">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 hospital-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-6">
                            <div className="h-20 w-20 rounded-3xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center font-bold text-2xl text-blue-600">
                                {appointment.patient?.full_name?.[0] || 'P'}
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight">{appointment.patient?.full_name || 'Anonymous'}</h1>
                                <p className="text-sm text-slate-500 font-medium">30 years · Male · PID: {id ? id.toString().slice(0, 8).toUpperCase() : 'N/A'}</p>
                                <div className="flex gap-2 mt-2">
                                    <Badge className="bg-emerald-50 text-emerald-600 border-none px-2 py-0 text-[9px] font-bold">Stable Vitals</Badge>
                                    <Badge className="bg-blue-50 text-blue-600 border-none px-2 py-0 text-[9px] font-bold">New Patient</Badge>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <Badge className={`px-4 py-1.5 rounded-full border-2 font-black text-xs uppercase ${
                                appointment.risk_level === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                                'bg-teal-50 text-teal-600 border-teal-100'
                            }`}>
                                {appointment.risk_level} Priority
                            </Badge>
                            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Triage Timestamp: 10:42 AM</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="text-center">
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Blood Pressure</p>
                            <p className="text-sm font-black">120/80</p>
                        </div>
                        <div className="text-center border-l border-slate-200 dark:border-slate-700">
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Heart Rate</p>
                            <p className="text-sm font-black">72 BPM</p>
                        </div>
                        <div className="text-center border-l border-slate-200 dark:border-slate-700">
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Temp</p>
                            <p className="text-sm font-black">98.6°F</p>
                        </div>
                        <div className="text-center border-l border-slate-200 dark:border-slate-700">
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Oxygen</p>
                            <p className="text-sm font-black text-emerald-600">98%</p>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="rounded-[2rem] border-none hospital-shadow">
                        <CardHeader className="flex flex-row items-center gap-2">
                            <Brain className="h-5 w-5 text-blue-600" />
                            <CardTitle className="text-lg font-bold">AI Risk Factors</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                { factor: "Symptom Pattern Consistency", score: 98, status: "High" },
                                { factor: "Demographic Risk Map", score: 45, status: "Low" },
                                { factor: "Vital Deviation Index", score: 12, status: "Normal" },
                            ].map((f, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-bold">
                                        <span className="text-slate-500">{f.factor}</span>
                                        <span className={f.status === 'High' ? 'text-blue-600' : 'text-slate-400'}>{f.score}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${f.score}%` }} />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-none hospital-shadow">
                        <CardHeader className="flex flex-row items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-blue-600" />
                            <CardTitle className="text-lg font-bold">Reported Symptoms</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {Array.isArray(appointment.symptoms) && appointment.symptoms.map((s: string) => (
                                    <Badge key={s} variant="secondary" className="px-3 py-1 text-xs font-bold bg-blue-50 text-blue-600 border-none">
                                        {s}
                                    </Badge>
                                ))}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed border-l-4 border-blue-100 dark:border-blue-900/50 pl-4 py-1">
                                "{appointment.symptoms_text || 'No additional details provided.'}"
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Right Column: Actions & Notes */}
            <div className="lg:col-span-4 space-y-6 sticky top-24">
                <Card className="rounded-[2rem] border-none hospital-shadow overflow-hidden">
                    <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                        <CardTitle className="text-sm font-bold flex items-center justify-between">
                            Consultation Notes
                            <FileText className="h-4 w-4 text-slate-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <Textarea 
                            placeholder="Type clinical observations here..." 
                            className="min-h-[300px] bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-2xl resize-none text-sm p-4"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                        <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold py-6 h-auto transition-all"
                            onClick={() => handleCloseConsultation('in_progress')}
                            disabled={saving}
                        >
                            <Save className="h-4 w-4 mr-2" /> Save Draft
                        </Button>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                    <Button 
                        variant="outline" 
                        className="rounded-2xl h-24 flex flex-col items-center justify-center gap-2 border-slate-100 bg-white dark:bg-slate-900 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 font-bold transition-all"
                        onClick={() => handleCloseConsultation('cancelled')}
                        disabled={saving}
                    >
                        <XCircle className="h-6 w-6" />
                        <span className="text-[10px] uppercase">Cancel Visit</span>
                    </Button>
                    <Button 
                        className="rounded-2xl h-24 flex flex-col items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all scale-105 active:scale-95"
                        onClick={() => handleCloseConsultation('completed')}
                        disabled={saving}
                    >
                        <CheckCircle className="h-6 w-6" />
                        <span className="text-[10px] uppercase">Complete Case</span>
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </DashboardShell>
  )
}
