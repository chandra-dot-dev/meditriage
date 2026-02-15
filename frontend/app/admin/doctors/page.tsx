"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/shared/DashboardShell"
import { 
  BarChart3, 
  Users, 
  Settings, 
  ShieldAlert,
  Search,
  Plus,
  MoreVertical,
  Activity,
  CheckCircle2,
  XCircle,
  Stethoscope
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/utils/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
  { label: "Overview", href: "/admin", icon: BarChart3 },
  { label: "Manage Doctors", href: "/admin/doctors", icon: Users },
  { label: "Emergency Monitoring", href: "/admin/emergency", icon: ShieldAlert },
  { label: "System Config", href: "/admin/settings", icon: Settings },
]

export default function AdminDoctorsPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    fetch('/api/doctors').then(res => res.json()).then(data => {
        setDoctors(data.doctors || [])
        setLoading(false)
    })
  }, [supabase])

  const filteredDoctors = doctors.filter(d => 
    d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardShell role="admin" navItems={navItems} userName={user?.user_metadata?.full_name}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Clinical Staff</h1>
                <p className="text-slate-500 text-sm">Manage doctor profiles, specializations, and availability status.</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Search staff..." 
                        className="pl-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold h-11 px-6 shadow-lg shadow-indigo-500/20">
                    <Plus className="h-4 w-4 mr-2" /> Add Doctor
                </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
                Array(6).fill(0).map((_, i) => (
                    <Card key={i} className="animate-pulse rounded-[2rem] border-none bg-slate-100 dark:bg-slate-800/50 h-64" />
                ))
            ) : filteredDoctors.length === 0 ? (
                <div className="col-span-full text-center py-20">
                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No doctors found matching your search.</p>
                </div>
            ) : (
                filteredDoctors.map((doc) => (
                    <Card key={doc.id} className="rounded-[2rem] border-none hospital-shadow group overflow-hidden hover:scale-[1.02] transition-all">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xl text-indigo-600">
                                    {doc.name?.[0] || 'D'}
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-xl">
                                            <MoreVertical className="h-4 w-4 text-slate-400" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-xl">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem className="rounded-lg">View Profile</DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-lg text-indigo-600">Edit Details</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="rounded-lg text-red-600">Restrict Access</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold tracking-tight">{doc.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge className="bg-indigo-50 text-indigo-600 border-none font-bold text-[9px] uppercase">
                                        {doc.specialization}
                                    </Badge>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{doc.experience_years}Y Experience</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                    <div className="flex items-center gap-1.5">
                                        {doc.is_available ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Activity className="h-3 w-3 text-amber-500" />}
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{doc.is_available ? 'Available' : 'Busy'}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Queue</p>
                                    <div className="flex items-center gap-1.5">
                                        <Users className="h-3 w-3 text-indigo-500" />
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">12 Patients</span>
                                    </div>
                                </div>
                            </div>

                            <Button variant="ghost" className="w-full rounded-xl text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-100 font-bold group-hover:scale-[1.01] transition-all">
                                Efficiency Stats <Stethoscope className="h-4 w-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
      </div>
    </DashboardShell>
  )
}
