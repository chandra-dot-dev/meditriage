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
  Users,
  Clock,
  MessageSquare,
  TrendingUp,
  Settings,
  Stethoscope,
  Briefcase,
  GraduationCap,
  Award,
  ChevronRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/utils/supabase/client"
import { motion } from "framer-motion"

const navItems = [
  { label: "Patient Queue", href: "/doctor", icon: Users },
  { label: "My Appointments", href: "/doctor/appointments", icon: Clock },
  { label: "Clinical Notes", href: "/doctor/notes", icon: MessageSquare },
  { label: "Statistics", href: "/doctor/stats", icon: TrendingUp },
]

export default function DoctorProfilePage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [doctorData, setDoctorData] = useState<any>(null)
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
        setUser(data.user)
        if (data.user) {
            supabase
                .from('doctors')
                .select('*')
                .eq('id', data.user.id)
                .maybeSingle()
                .then(({ data: doc }) => setDoctorData(doc))
        }
    })
  }, [supabase])

  const stats = [
    { label: "Patients Seen", value: "1,240+", icon: Users, color: "blue" },
    { label: "Avg. Wait Time", value: "14m", icon: Clock, color: "emerald" },
    { label: "Positive Reviews", value: "98%", icon: Award, color: "amber" },
  ]

  return (
    <DashboardShell role="doctor" navItems={navItems} userName={user?.user_metadata?.full_name}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Clinical Profile</h1>
                <p className="text-slate-500 text-sm">Manage your professional credentials and availability.</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-800 font-bold px-6">
                    <Settings className="h-4 w-4 mr-2" /> Settings
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-8 shadow-lg shadow-blue-500/20">
                   Edit Profile
                </Button>
            </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <Card className="rounded-[2.5rem] border-none hospital-shadow overflow-hidden">
                    <CardContent className="p-8 flex flex-col items-center text-center">
                        <div className="h-32 w-32 rounded-[2.5rem] bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-6 relative group cursor-pointer">
                            <span className="text-4xl font-black text-blue-600 dark:text-blue-400">
                                {user?.user_metadata?.full_name?.[0] || 'D'}
                            </span>
                            <div className="absolute inset-0 bg-blue-600/20 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Stethoscope className="text-white h-8 w-8" />
                            </div>
                        </div>
                        <h2 className="text-xl font-black mb-1">Dr. {user?.user_metadata?.full_name?.split(' ').pop() || 'Doctor'}</h2>
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-6">
                            {doctorData?.specialization || 'General Practitioner'}
                        </p>
                        
                        <div className="w-full space-y-3 text-left">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <Mail className="h-4 w-4 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">{user?.email}</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <Shield className="h-4 w-4 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">ID: #MED-{user?.id?.slice(0, 8)}</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{doctorData?.experience_years || '10'} Years Experience</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="p-6 bg-blue-600 rounded-[2rem] text-white hospital-shadow relative overflow-hidden group">
                    <div className="absolute bottom-0 right-0 h-24 w-24 -mr-6 -mb-6 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                    <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                        <Activity className="h-4 w-4" /> Shift Status
                    </h3>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs opacity-80">Online & Available</span>
                        <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
                    </div>
                    <Button variant="ghost" className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold h-9">
                        Go Offline
                    </Button>
                </div>
            </div>

            <div className="lg:col-span-3 space-y-8">
                <div className="grid sm:grid-cols-3 gap-6">
                    {stats.map((stat, i) => (
                        <Card key={i} className="rounded-[2rem] border-none hospital-shadow p-6 group hover:translate-y-[-4px] transition-all">
                            <div className={`h-10 w-10 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-xl flex items-center justify-center mb-4`}>
                                <stat.icon className={`h-5 w-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                            <p className="text-2xl font-black">{stat.value}</p>
                        </Card>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <Card className="rounded-[2.5rem] border-none hospital-shadow overflow-hidden">
                        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-blue-600" /> Clinical Expertise
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {["Cardiology", "Internal Medicine", "Emergency Triage", "Critical Care", "Hyperbaric Medicine"].map(tag => (
                                    <Badge key={tag} variant="secondary" className="rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-none font-bold text-[10px] px-3 py-1">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed italic">
                                "{doctorData?.bio || 'Dedicated clinical professional with over a decade of experience in emergency department triage and patient stabilization.'}"
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] border-none hospital-shadow overflow-hidden">
                        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-emerald-600" /> Education
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                        <Award className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">MD, Stanford Medical School</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Class of 2012</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                        <GraduationCap className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">BSc Biology, Johns Hopkins</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Graduated 2008</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="rounded-[2.5rem] border-none hospital-shadow overflow-hidden">
                    <CardHeader className="p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold">Recent Publications</CardTitle>
                                <CardDescription className="text-xs">Clinical research and case studies</CardDescription>
                            </div>
                            <Button variant="ghost" className="text-blue-600 font-bold text-sm">View Google Scholar</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 space-y-4">
                        {[
                            "Machine Learning in Emergency Dept Triage: A Multicenter Study",
                            "Reducing Mortality Rates through AI-Enhanced Cardiovascular Screening",
                            "Ethics of Artificial Intelligence in Clinical Decision Support"
                        ].map((pub, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between group cursor-pointer hover:border-blue-200 transition-all">
                                <div className="flex items-center gap-4">
                                    <FileText className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                    <span className="text-sm font-bold truncate leading-none">{pub}</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </DashboardShell>
  )
}
