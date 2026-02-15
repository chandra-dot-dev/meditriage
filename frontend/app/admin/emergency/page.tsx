"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/shared/DashboardShell"
import { 
  BarChart3, 
  Users, 
  Settings, 
  ShieldAlert,
  AlertTriangle,
  MapPin,
  Clock,
  ArrowUpRight,
  Zap,
  Phone
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

const navItems = [
  { label: "Overview", href: "/admin", icon: BarChart3 },
  { label: "Manage Doctors", href: "/admin/doctors", icon: Users },
  { label: "Emergency Monitoring", href: "/admin/emergency", icon: ShieldAlert },
  { label: "System Config", href: "/admin/settings", icon: Settings },
]

export default function AdminEmergencyPage() {
  return (
    <DashboardShell role="admin" navItems={navItems} userName="Admin">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Emergency Monitoring</h1>
                <p className="text-slate-500 text-sm">Real-time oversight of high-risk triage events and critical department loads.</p>
            </div>
            <Button variant="destructive" className="rounded-xl font-bold h-12 px-6 shadow-lg shadow-red-500/20">
                <Zap className="h-4 w-4 mr-2" /> Global Alert
            </Button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
                {[
                    { patient: "James Wilson", risk: "CRITICAL", dept: "Cardiology", wait: "2m", status: "In Triage" },
                    { patient: "Sarah Miller", risk: "HIGH", dept: "Emergency", wait: "5m", status: "Awaiting Doc" },
                ].map((alert, i) => (
                    <Card key={i} className="rounded-[2rem] border-none hospital-shadow overflow-hidden bg-white dark:bg-slate-900 border-l-4 border-l-red-500">
                        <CardContent className="p-8 flex items-center justify-between gap-6">
                             <div className="flex items-center gap-6">
                                <div className="h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                                    <AlertTriangle className="h-7 w-7 text-red-600 animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">{alert.patient}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{alert.dept} · Wait: {alert.wait}</p>
                                    <div className="flex gap-2 mt-2">
                                        <Badge className="bg-red-50 text-red-600 border-none text-[9px] font-black uppercase tracking-widest">{alert.risk}</Badge>
                                        <Badge className="bg-slate-50 text-slate-500 border-none text-[9px] font-black uppercase tracking-widest">{alert.status}</Badge>
                                    </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <Button size="icon" variant="ghost" className="rounded-xl hover:bg-red-50 text-red-600">
                                    <Phone className="h-4 w-4" />
                                </Button>
                                <Button className="bg-slate-100 font-bold dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs h-10 px-5">
                                    Manage Transfer
                                </Button>
                             </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="lg:col-span-4 space-y-6">
                <Card className="rounded-[2rem] border-none hospital-shadow">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Facility Load</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {[
                            { name: "ER Bay 1", load: 90, status: "Critical" },
                            { name: "ER Bay 2", load: 20, status: "Stable" },
                            { name: "ICU Access", load: 65, status: "High" },
                        ].map((b, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-slate-500">{b.name}</span>
                                    <span className={b.load > 80 ? 'text-red-600' : 'text-slate-900 dark:text-white'}>{b.load}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                     <div className={`h-full rounded-full ${b.load > 80 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${b.load}%` }} />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none hospital-shadow bg-indigo-600 text-white p-8">
                    <CardTitle className="text-lg font-bold mb-4">Staff Alert Mode</CardTitle>
                    <p className="text-sm opacity-90 leading-relaxed mb-6">
                        System automatically triggers staff mobile alerts for any patient with a triage risk confidence {" > "}95% and priority level &apos;Critical&apos;.
                    </p>
                    <Button variant="ghost" className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold">
                        Configure Thresholds
                    </Button>
                </Card>
            </div>
        </div>
      </div>
    </DashboardShell>
  )
}
