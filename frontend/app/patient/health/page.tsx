"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/shared/DashboardShell"
import { 
  Calendar, 
  LayoutDashboard, 
  History, 
  UserCircle,
  Activity,
  Heart,
  Wind,
  Moon,
  Smartphone,
  RefreshCw,
  TrendingUp,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/utils/supabase/client"
import { motion } from "framer-motion"

const navItems = [
  { label: "Overview", href: "/patient", icon: LayoutDashboard },
  { label: "Book Appointment", href: "/patient/book", icon: Calendar },
  { label: "Triage History", href: "/patient/history", icon: History },
  { label: "Profile", href: "/patient/profile", icon: UserCircle },
]

export default function PatientHealthPortal() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [metrics, setMetrics] = useState([
    { label: "Heart Rate", value: "72", unit: "BPM", icon: Heart, color: "red", trend: "Stable" },
    { label: "SpO2", value: "98", unit: "%", icon: Wind, color: "blue", trend: "Optimal" },
    { label: "Sleep", value: "7h 20m", unit: "", icon: Moon, color: "indigo", trend: "+12m" },
    { label: "Activity", value: "8,432", unit: "Steps", icon: Activity, color: "emerald", trend: "Target reached" },
  ])
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [supabase])

  const handleSync = () => {
    setIsSyncing(true)
    
    // Simulate data fetch from wearable
    setTimeout(() => {
        setMetrics(prev => prev.map(m => {
            if (m.label === "Heart Rate") return { ...m, value: (Math.floor(Math.random() * (85 - 65) + 65)).toString(), trend: "Sync OK" }
            if (m.label === "Activity") return { ...m, value: (parseInt(m.value.replace(',', '')) + Math.floor(Math.random() * 100)).toLocaleString(), trend: "Updating..." }
            return m
        }))
        setIsSyncing(false)
    }, 2000)
  }

  return (
    <DashboardShell role="patient" navItems={navItems} userName={user?.user_metadata?.full_name}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Health Portal</h1>
                <p className="text-slate-500 text-sm italic decoration-teal-500/20 underline underline-offset-4">
                  Synchronize your wearable data to provide our AI models with real-time biometric context.
                </p>
            </div>
            <Button 
                onClick={handleSync}
                disabled={isSyncing}
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold h-12 px-8 shadow-lg shadow-teal-500/20"
            >
                {isSyncing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Smartphone className="h-4 w-4 mr-2" />}
                {isSyncing ? "Syncing Biometrics..." : "Sync Wearable Devices"}
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((m, i) => (
                <Card key={i} className="rounded-3xl border-none hospital-shadow overflow-hidden group">
                    <CardContent className="p-6 relative">
                        <div className={`absolute top-0 right-0 h-20 w-20 -mr-6 -mt-6 bg-${m.color}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform`} />
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`h-12 w-12 bg-${m.color}-50 dark:bg-${m.color}-900/20 rounded-2xl flex items-center justify-center`}>
                                <m.icon className={`h-6 w-6 text-${m.color}-600 dark:text-${m.color}-400`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{m.label}</p>
                                <p className="text-2xl font-black">{m.value}<span className="text-xs ml-1 font-medium text-slate-400">{m.unit}</span></p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">{m.trend}</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
             <Card className="lg:col-span-2 rounded-[2rem] border-none hospital-shadow overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-8 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold">Biometric Trends</CardTitle>
                        <CardDescription className="text-xs">Your health data over the last 7 days</CardDescription>
                    </div>
                    <Badge variant="outline" className="rounded-lg border-slate-200 uppercase text-[9px] font-black tracking-widest">Live Sync: Active</Badge>
                </CardHeader>
                <CardContent className="p-12 flex flex-col items-center justify-center min-h-[300px] text-center">
                    <div className="h-48 w-full flex items-end justify-between gap-4 mb-8">
                        {[40, 65, 30, 85, 55, 90, 75].map((h, i) => (
                            <motion.div 
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                className={`flex-1 rounded-t-xl bg-gradient-to-t from-teal-500 to-teal-400 opacity-${20 + (i*10)}`}
                            />
                        ))}
                    </div>
                    <p className="text-slate-400 text-xs font-medium">Visualization of normalized biometric indices (Sync to update)</p>
                </CardContent>
             </Card>

             <div className="space-y-6">
                <Card className="rounded-[2rem] border-none hospital-shadow bg-teal-600 text-white p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 bg-white/10 rounded-full blur-3xl" />
                    <CardTitle className="text-lg font-bold mb-2">Clinical Impact</CardTitle>
                    <p className="text-sm opacity-90 leading-relaxed mb-6">
                        Synchronized wearable data allows our AI to detect tachycardia and hypoxia events before they become critical.
                    </p>
                    <div className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl">
                        <AlertCircle className="h-5 w-5 text-teal-200" />
                        <span className="text-xs font-bold leading-tight">92% higher triage accuracy when biometrics are active.</span>
                    </div>
                </Card>
                
                <Card className="rounded-[2rem] border-none hospital-shadow p-8">
                    <CardTitle className="text-lg font-bold mb-4">Connected Devices</CardTitle>
                    <div className="space-y-4">
                        {[
                            { name: "MediWatch 4", model: "WearOS 5.0", status: "Connected" },
                            { name: "MediScale Gen 2", model: "WiFi Sync", status: "Disconnected" },
                        ].map((d, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div>
                                    <p className="text-sm font-bold">{d.name}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{d.model}</p>
                                </div>
                                <div className={`h-2 w-2 rounded-full ${d.status === 'Connected' ? 'bg-emerald-500' : 'bg-slate-300 animate-pulse'}`} />
                            </div>
                        ))}
                    </div>
                    <Button variant="ghost" className="w-full mt-6 rounded-xl text-teal-600 font-bold text-sm">
                        Link New Device +
                    </Button>
                </Card>
             </div>
        </div>
      </div>
    </DashboardShell>
  )
}
