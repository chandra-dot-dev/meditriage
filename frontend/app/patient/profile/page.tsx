"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/shared/DashboardShell"
import { 
  User, 
  Mail, 
  MapPin, 
  Phone, 
  Activity, 
  Shield, 
  FileText, 
  Calendar,
  LayoutDashboard,
  History,
  Heart,
  TrendingUp,
  Settings,
  LogOut,
  UserCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/utils/supabase/client"
import { motion } from "framer-motion"

const navItems = [
  { label: "Overview", href: "/patient", icon: LayoutDashboard },
  { label: "Book Appointment", href: "/patient/book", icon: Calendar },
  { label: "Health Portal", href: "/patient/health", icon: Activity },
  { label: "Triage History", href: "/patient/history", icon: History },
  { label: "Profile", href: "/patient/profile", icon: UserCircle },
]

export default function PatientProfilePage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [supabase])

  return (
    <DashboardShell role="patient" navItems={navItems} userName={user?.user_metadata?.full_name}>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Personal Records</h1>
                <p className="text-slate-500 text-sm">Manage your clinical profile and account settings.</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-800 font-bold px-6">
                    <Settings className="h-4 w-4 mr-2" /> Settings
                </Button>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold px-8 shadow-lg shadow-teal-500/20">
                   Update Profile
                </Button>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <Card className="rounded-[2.5rem] border-none hospital-shadow overflow-hidden">
                    <CardContent className="p-8 flex flex-col items-center text-center">
                        <div className="h-24 w-24 rounded-[2rem] bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center mb-6">
                            <span className="text-3xl font-black text-teal-600 dark:text-teal-400">
                                {user?.user_metadata?.full_name?.[0] || 'U'}
                            </span>
                        </div>
                        <h2 className="text-xl font-black mb-1">{user?.user_metadata?.full_name || 'Patient User'}</h2>
                        <Badge variant="secondary" className="rounded-lg bg-teal-50 text-teal-600 border-none font-bold uppercase text-[10px] tracking-widest px-3 mb-6">
                            Verified Patient
                        </Badge>
                        
                        <div className="w-full space-y-4 text-left">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <Mail className="h-4 w-4 text-slate-400" />
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">{user?.email}</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <Phone className="h-4 w-4 text-slate-400" />
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">+1 (555) 012-3456</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">San Francisco, CA</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] border-none hospital-shadow p-8 bg-slate-900 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 bg-teal-500/20 rounded-full blur-3xl" />
                     <h3 className="text-lg font-bold mb-4 relative z-10">Data Privacy</h3>
                     <p className="text-slate-400 text-sm mb-6 relative z-10 leading-relaxed">
                        Your clinical data is encrypted with AES-256 and stored in HIPAA-compliant infrastructure.
                     </p>
                     <Button variant="ghost" className="w-full justify-start text-teal-400 hover:text-teal-300 hover:bg-white/5 p-0 font-bold relative z-10">
                        View Audit Log <ChevronRight className="h-4 w-4 ml-2" />
                     </Button>
                </Card>
            </div>

            <div className="lg:col-span-2 space-y-8">
                <div className="grid sm:grid-cols-2 gap-6">
                    <Card className="rounded-[2rem] border-none hospital-shadow p-8 group transition-all hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <div className="flex items-center justify-between mb-6">
                            <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <Badge variant="outline" className="text-[9px] font-black border-slate-100 dark:border-slate-800">Primary</Badge>
                        </div>
                        <h4 className="text-sm font-bold mb-1">Insurance Policy</h4>
                        <p className="text-xs text-slate-500 font-medium tracking-tight">Active Plan · Group #8832-11</p>
                    </Card>

                    <Card className="rounded-[2rem] border-none hospital-shadow p-8 group transition-all hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <div className="flex items-center justify-between mb-6">
                            <div className="h-10 w-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
                                <Activity className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <Badge variant="outline" className="text-[9px] font-black border-slate-100 dark:border-slate-800">Emergency</Badge>
                        </div>
                        <h4 className="text-sm font-bold mb-1">Health Summary</h4>
                        <p className="text-xs text-slate-500 font-medium tracking-tight">Type O+ · No known allergies</p>
                    </Card>
                </div>

                <Card className="rounded-[2.5rem] border-none hospital-shadow overflow-hidden">
                    <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-8 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold">Health History</CardTitle>
                                <CardDescription className="text-xs">Timeline of your recent triage assessments</CardDescription>
                            </div>
                            <Button variant="ghost" className="rounded-xl font-bold text-teal-600 text-sm">View History</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {[
                                { date: "Feb 12, 2026", type: "Cardiology", result: "Medium Risk", icon: Heart, color: "red" },
                                { date: "Jan 15, 2026", type: "General Checkup", result: "Low Risk", icon: Activity, color: "teal" },
                                { date: "Dec 04, 2025", type: "Neurology", result: "Normal", icon: TrendingUp, color: "blue" },
                            ].map((item, i) => (
                                <div key={i} className="px-8 py-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 bg-${item.color}-50 dark:bg-${item.color}-900/20 rounded-xl flex items-center justify-center`}>
                                            <item.icon className={`h-5 w-5 text-${item.color}-600 dark:text-${item.color}-400`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold tracking-tight">{item.type}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline" className="rounded-lg border-slate-100 dark:border-slate-800 capitalize font-bold text-[10px]">{item.result}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                
                <div className="flex gap-4">
                     <Button variant="ghost" className="flex-1 py-8 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 h-auto flex flex-col items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <FileText className="h-6 w-6 text-slate-400" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Download EHR</span>
                     </Button>
                     <Button variant="ghost" className="flex-1 py-8 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 h-auto flex flex-col items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <Shield className="h-6 w-6 text-slate-400" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Privacy Policy</span>
                     </Button>
                </div>
            </div>
        </div>
      </div>
    </DashboardShell>
  )
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
