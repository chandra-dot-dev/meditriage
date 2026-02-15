"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardShell } from "@/components/shared/DashboardShell"
import { 
  Calendar, 
  LayoutDashboard, 
  History, 
  UserCircle,
  Stethoscope,
  ChevronRight,
  ChevronLeft,
  Search,
  Check,
  FileText,
  AlertCircle,
  Loader2,
  Brain,
  Activity
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

const navItems = [
  { label: "Overview", href: "/patient", icon: LayoutDashboard },
  { label: "Book Appointment", href: "/patient/book", icon: Calendar },
  { label: "Health Portal", href: "/patient/health", icon: Activity },
  { label: "Triage History", href: "/patient/history", icon: History },
  { label: "Profile", href: "/patient/profile", icon: UserCircle },
]

const SYMPTOMS = [
  "Chest Pain", "Shortness of Breath", "Fever", "Headache", 
  "Dizziness", "Cough", "Nausea", "Fatigue", 
  "Abdominal Pain", "Joint Pain", "Skin Rash", "Blurred Vision"
]

export default function BookAppointmentPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // Form State
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [symptomsText, setSymptomsText] = useState("")
  const [doctors, setDoctors] = useState<any[]>([])
  const [triageResult, setTriageResult] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    fetch('/api/doctors').then(res => res.json()).then(data => setDoctors(data.doctors || []))
  }, [supabase])

  const runTriage = async () => {
    setAnalyzing(true)
    setStep(3)
    try {
        const res = await fetch('/api/triage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                symptoms: selectedSymptoms,
                symptoms_text: symptomsText,
                age: 30, // Default for now, should be from profile
                gender: 'Male'
            })
        })
        if (res.ok) {
            const data = await res.json()
            setTriageResult(data)
        }
    } catch (e) {
        console.error(e)
    } finally {
        setAnalyzing(false)
    }
  }

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(s) ? prev.filter(i => i !== s) : [...prev, s]
    )
  }

  const handleSubmit = async () => {
    if (!selectedDoctor || !triageResult) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: user?.id,
          doctor_id: selectedDoctor.id,
          symptoms: selectedSymptoms,
          symptoms_text: symptomsText,
          risk_level: triageResult.risk_level,
          priority_score: Math.round(triageResult.confidence),
          status: 'pending'
        })
      })
      
      if (res.ok) {
        router.push('/patient?success=booked')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardShell role="patient" navItems={navItems} userName={user?.user_metadata?.full_name}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight">Book Clinical Triage</h1>
            <p className="text-slate-500 text-sm">Follow the steps below to schedule your assessment.</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-2 no-scrollbar">
            {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2 shrink-0">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        step === s ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30' : 
                        step > s ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40' : 
                        'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                        {step > s ? <Check className="h-4 w-4" /> : s}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${step === s ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                        {s === 1 ? 'Select Doctor' : s === 2 ? 'Describe Symptoms' : 'Confirm'}
                    </span>
                    {s < 3 && <div className="w-12 h-px bg-slate-200 dark:bg-slate-800" />}
                </div>
            ))}
        </div>

        <AnimatePresence mode="wait">
            {step === 1 && (
                <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid gap-6"
                >
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search by name or specialization..." className="pl-10 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl" />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {doctors.map((doc) => (
                            <Card 
                                key={doc.id}
                                className={`rounded-2xl border-2 transition-all cursor-pointer group hover:shadow-md ${
                                    selectedDoctor?.id === doc.id ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/10' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'
                                }`}
                                onClick={() => setSelectedDoctor(doc)}
                            >
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                        {doc.name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate">{doc.name}</p>
                                        <p className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400">{doc.specialization}</p>
                                    </div>
                                    {selectedDoctor?.id === doc.id && (
                                        <div className="h-6 w-6 rounded-full bg-teal-500 flex items-center justify-center">
                                            <Check className="h-3 w-3 text-white" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button 
                            disabled={!selectedDoctor}
                            onClick={() => setStep(2)}
                            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 py-6 h-auto font-bold gap-2"
                        >
                            Continue <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </motion.div>
            )}

            {step === 2 && (
                <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                >
                    <div className="space-y-4">
                        <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">Common Symptoms</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {SYMPTOMS.map((s) => (
                                <Badge
                                    key={s}
                                    variant="outline"
                                    className={`py-2.5 px-3 rounded-lg cursor-pointer transition-all border-2 text-xs font-medium justify-center ${
                                        selectedSymptoms.includes(s) ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'
                                    }`}
                                    onClick={() => toggleSymptom(s)}
                                >
                                    {s}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="symptoms" className="text-sm font-bold uppercase tracking-wider text-slate-500">Additional Details</Label>
                        <Textarea 
                            id="symptoms" 
                            placeholder="Describe how you feel in detail..." 
                            className="min-h-[150px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm"
                            value={symptomsText}
                            onChange={(e) => setSymptomsText(e.target.value)}
                        />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 p-4 rounded-xl flex gap-3 text-blue-700 dark:text-blue-400 text-xs">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p>Our AI will prioritize your case based on these symptoms. If you describe life-threatening issues, you will be flagged for immediate emergency care.</p>
                    </div>

                    <div className="flex justify-between">
                        <Button variant="ghost" onClick={() => setStep(1)} className="rounded-xl px-6 font-bold gap-2">
                            <ChevronLeft className="h-4 w-4" /> Back
                        </Button>
                        <Button 
                            disabled={selectedSymptoms.length === 0 && !symptomsText}
                            onClick={runTriage}
                            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 py-6 h-auto font-bold gap-2"
                        >
                            Analyze & Review <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </motion.div>
            )}

            {step === 3 && (
                <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                >
                    <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hospital-shadow overflow-hidden">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b border-slate-200 dark:border-slate-800">
                             <h3 className="font-bold flex items-center gap-2">
                                <Stethoscope className="h-5 w-5 text-teal-600" />
                                Appointment Summary
                             </h3>
                        </div>
                        <CardContent className="p-8 space-y-8">
                            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-4">
                                <span className="text-sm font-medium text-slate-500">Assigned Provider</span>
                                <div className="text-right">
                                    <p className="font-bold">{selectedDoctor?.name}</p>
                                    <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 underline">{selectedDoctor?.specialization}</p>
                                </div>
                            </div>

                            <div className="space-y-4 border-b border-slate-50 dark:border-slate-800 pb-4">
                                <span className="text-sm font-medium text-slate-500">Reported Symptoms</span>
                                <div className="flex flex-wrap gap-2">
                                    {selectedSymptoms.map(s => (
                                        <Badge key={s} variant="secondary" className="px-2 py-1 text-[10px]">{s}</Badge>
                                    ))}
                                    {selectedSymptoms.length === 0 && <span className="text-xs italic text-slate-400">None selected</span>}
                                </div>
                            </div>

                            {analyzing ? (
                                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <Loader2 className="h-8 w-8 text-teal-600 animate-spin mb-4" />
                                    <p className="text-sm font-bold animate-pulse">AI Risk Analysis in Progress...</p>
                                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Consulting clinical models</p>
                                </div>
                            ) : triageResult ? (
                                <div className={`p-6 rounded-2xl border-2 transition-all ${
                                    triageResult.risk_level === 'High' ? 'bg-red-50 border-red-100 text-red-900' :
                                    triageResult.risk_level === 'Medium' ? 'bg-amber-50 border-amber-100 text-amber-900' :
                                    'bg-teal-50 border-teal-100 text-teal-900'
                                }`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                                            triageResult.risk_level === 'High' ? 'bg-red-500 text-white' :
                                            triageResult.risk_level === 'Medium' ? 'bg-amber-500 text-white' :
                                            'bg-teal-500 text-white'
                                        }`}>
                                            <Brain className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest opacity-70">AI Risk Assessment</p>
                                            <p className="text-xl font-black">{triageResult.risk_level} Priority</p>
                                        </div>
                                        <Badge variant="outline" className="ml-auto font-bold border-current opacity-70">
                                            {Math.round(triageResult.confidence)}% Confidence
                                        </Badge>
                                    </div>
                                    <p className="text-sm leading-relaxed mb-4 italic font-medium">"{triageResult.explanation}"</p>
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <p className="text-xs font-bold">Recommended Department: {triageResult.department}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100">
                                    Failed to retrieve AI analysis. Please try again.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <Button variant="ghost" onClick={() => setStep(2)} className="rounded-xl px-6 font-bold gap-2">
                            <ChevronLeft className="h-4 w-4" /> Edit
                        </Button>
                        <Button 
                            disabled={loading || analyzing || !triageResult}
                            onClick={handleSubmit}
                            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-12 py-6 h-auto font-bold gap-2 shadow-xl shadow-teal-500/20"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Booking'}
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </DashboardShell>
  )
}
