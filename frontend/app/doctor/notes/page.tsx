"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { DashboardShell } from "@/components/shared/DashboardShell"
import { 
  Users, 
  MessageSquare, 
  Search,
  Plus,
  Save,
  Clock,
  User,
  Activity,
  TrendingUp,
  Filter,
  ArrowRight,
  Database
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/toaster"

const navItems = [
  { label: "Patient Queue", href: "/doctor", icon: Users },
  { label: "My Appointments", href: "/doctor/appointments", icon: Clock },
  { label: "Clinical Notes", href: "/doctor/notes", icon: MessageSquare },
  { label: "Statistics", href: "/doctor/stats", icon: TrendingUp },
]

export default function ClinicalNotesPage() {
  const [user, setUser] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [noteText, setNoteText] = useState("")
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
        setUser(data.user)
        if (data.user) {
            fetchAppointments(data.user.id)
        }
    })
  }, [supabase])

  const fetchAppointments = async (doctorId: string) => {
    try {
      const res = await fetch(`/api/appointments?doctor_id=${doctorId}`)
      const data = await res.json()
      setAppointments(data.appointments || [])
    } catch (err) {
      console.error("Failed to fetch appointments for notes")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNote = async () => {
    if (!selectedAppointment || !noteText.trim()) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAppointment.id,
          notes: noteText
        })
      })

      if (res.ok) {
        toast({
            title: "Note Saved",
            description: "Clinical documentation successfully updated.",
            type: "success"
        })
        setAppointments(prev => prev.map(a => a.id === selectedAppointment.id ? { ...a, notes: noteText } : a))
      }
    } catch (err) {
      toast({
          title: "Save Failed",
          description: "There was an error saving the clinical note.",
          type: "error"
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardShell role="doctor" navItems={navItems} userName={user?.user_metadata?.full_name}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Clinical Documentation</h1>
                <p className="text-slate-500 text-sm max-w-lg">
                    Review history and add clinical notes for your assigned patients.
                </p>
            </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-280px)]">
            {/* Sidebar Patients List */}
            <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                <Card className="rounded-[2.2rem] border-none hospital-shadow flex flex-col h-full overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Assigned Patients</CardTitle>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                <Filter className="h-4 w-4 text-slate-400" />
                            </Button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <Input placeholder="Search records..." className="pl-10 h-10 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs" />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="p-4 animate-pulse flex items-center gap-3">
                                    <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                                    <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
                                </div>
                            ))
                        ) : appointments.length === 0 ? (
                           <div className="p-10 text-center opacity-50">
                                <Database className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                                <p className="text-xs font-bold text-slate-400">No records found</p>
                           </div>
                        ) : appointments.map((appointment) => (
                            <div 
                                key={appointment.id}
                                onClick={() => {
                                    setSelectedAppointment(appointment)
                                    setNoteText(appointment.notes || "")
                                }}
                                className={`p-4 rounded-2xl cursor-pointer transition-all mb-1 flex items-center justify-between group ${
                                    selectedAppointment?.id === appointment.id 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                                        selectedAppointment?.id === appointment.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                    }`}>
                                        {appointment.patient?.full_name?.[0] || 'P'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-bold truncate">{appointment.patient?.full_name || 'Anonymous'}</p>
                                        <p className={`text-[9px] font-bold uppercase tracking-wider opacity-60`}>
                                            {appointment.risk_level || 'Normal'} Risk
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className={`h-3 w-3 transition-transform ${selectedAppointment?.id === appointment.id ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Note Editor */}
            <div className="lg:col-span-8 flex flex-col h-full">
                <Card className="rounded-[2.2rem] border-none hospital-shadow flex flex-col h-full overflow-hidden">
                    <AnimatePresence mode="wait">
                        {selectedAppointment ? (
                            <motion.div 
                                key={selectedAppointment.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col h-full"
                            >
                                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-white dark:bg-slate-900 rounded-xl hospital-shadow flex items-center justify-center">
                                            <User className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black tracking-tight">{selectedAppointment.patient?.full_name || 'Patient Record'}</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assessment ID: {selectedAppointment.id.slice(0,8)}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={`rounded-full px-3 py-1 font-bold text-[9px] uppercase border-2 ${
                                        selectedAppointment.risk_level === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                    }`}>
                                        {selectedAppointment.risk_level} Priority
                                    </Badge>
                                </div>
                                
                                <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Reported Symptoms</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedAppointment.symptoms?.map((s: string) => (
                                                    <span key={s} className="text-[10px] font-bold bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Triage Logic</p>
                                            <p className="text-xs italic font-medium">"{selectedAppointment.symptoms_text || 'No description provided'}"</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 flex-1 flex flex-col">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold flex items-center gap-2">
                                                <MessageSquare className="h-4 w-4 text-blue-600" />
                                                Add Clinical Observations
                                            </label>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auto-saving enabled</span>
                                        </div>
                                        <Textarea 
                                            value={noteText}
                                            onChange={(e) => setNoteText(e.target.value)}
                                            placeholder="Document your findings, prescribed treatment, or escalation plan here..."
                                            className="flex-1 min-h-[200px] border-none bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-8 text-sm leading-relaxed focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900">
                                     <Button variant="ghost" className="rounded-xl font-bold px-6">Discard</Button>
                                     <Button 
                                        onClick={handleSaveNote}
                                        disabled={saving || !noteText.trim()}
                                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-8 shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                                     >
                                        {saving ? 'Syncing...' : (
                                            <><Save className="h-4 w-4 mr-2" /> Commit Clinical Note</>
                                        )}
                                     </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-20 text-center opacity-50">
                                <div className="h-20 w-20 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] flex items-center justify-center mb-6">
                                    <MessageSquare className="h-10 w-10 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-black mb-2">No Record Selected</h3>
                                <p className="text-sm text-slate-500 max-w-xs mx-auto">Select a patient from the sidebar to view clinical history and add new documentation.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </Card>
            </div>
        </div>
      </div>
    </DashboardShell>
  )
}
