"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { DashboardShell } from "@/components/shared/DashboardShell"
import { 
  BarChart3, 
  Users, 
  Settings, 
  ShieldAlert, 
  Activity, 
  Building2, 
  Search,
  ArrowUp,
  Download,
  MoreVertical,
  Plus,
  Zap
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/toaster"

const navItems = [
  { label: "Overview", href: "/admin", icon: BarChart3 },
  { label: "Manage Doctors", href: "/admin/doctors", icon: Users },
  { label: "Emergency Monitoring", href: "/admin/emergency", icon: ShieldAlert },
  { label: "System Config", href: "/admin/settings", icon: Settings },
]

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics')
      const data = await res.json()
      setAnalytics(data)
    } catch (err) {
      console.error("Failed to fetch analytics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    fetchAnalytics()

    // Real-time subscription for new appointments
    const channel = supabase
      .channel('admin_stats')
      .on('postgres_changes', { 
        event: 'INSERT', 
        table: 'appointments', 
        schema: 'public' 
      }, (payload) => {
        fetchAnalytics()
        
        // Trigger emergency toast for high-risk patients
        if (payload.new.risk_level === 'High') {
          toast({
            title: "CRITICAL ALERT",
            description: `High-risk patient detected in ${payload.new.department || 'Emergency'}. Immediate review required.`,
            type: "emergency"
          })
        }
      })
      .on('postgres_changes', { event: 'UPDATE', table: 'appointments', schema: 'public' }, () => {
        fetchAnalytics()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, toast])

  const simulateTraffic = async () => {
    setIsSimulating(true)
    try {
      await fetch('/api/admin/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 3 })
      })
      toast({
          title: "Simulation Started",
          description: "Generating synthetic patient traffic...",
          type: "success"
      })
    } catch (err) {
      console.error("Simulation failed")
    } finally {
      setIsSimulating(false)
    }
  }

  const exportToCSV = () => {
    if (!analytics?.deptLoad) return
    const headers = ["Department", "Patients", "Load Percentage"]
    const rows = analytics.deptLoad.map((d: any) => [d.dept, d.patients, `${d.load}%`])
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `hospital_oversight_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
        title: "Report Exported",
        description: "Your hospital oversight data has been downloaded as CSV.",
        type: "success"
    })
  }

  const stats = [
    { label: "Total Patients", value: analytics?.stats?.totalPatients || "...", sub: "+12% from last month", icon: Users, color: "teal" },
    { label: "Active Doctors", value: analytics?.stats?.activeDoctors || "...", sub: "Currently on shift", icon: Activity, color: "blue" },
    { label: "Wait Time Avg", value: analytics?.stats?.waitTimeAvg || "...", sub: "Stable flow", icon: Building2, color: "indigo" },
    { label: "Risk Alerts", value: analytics?.stats?.riskAlerts || "...", sub: "Require supervision", icon: ShieldAlert, color: "red" },
  ]

  return (
    <DashboardShell 
      role="admin" 
      navItems={navItems} 
      userName={user?.user_metadata?.full_name}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Hospital Oversight</h1>
                <p className="text-slate-500 text-sm max-w-lg">
                    Comprehensive monitoring of patient flow, risk distribution, and staff efficiency across all departments.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <Button 
                    onClick={simulateTraffic} 
                    disabled={isSimulating}
                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold px-6 shadow-lg shadow-teal-500/20"
                >
                    <Zap className={`h-4 w-4 mr-2 ${isSimulating ? 'animate-pulse' : ''}`} /> 
                    {isSimulating ? "Simulating..." : "Simulate Traffic"}
                </Button>
                <Button 
                    variant="outline" 
                    onClick={exportToCSV}
                    className="rounded-xl border-slate-200 dark:border-slate-800 font-bold"
                >
                    <Download className="h-4 w-4 mr-2" /> Export Report
                </Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold px-6">
                    <Plus className="h-4 w-4 mr-2" /> Register Staff
                </Button>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="rounded-2xl border-none hospital-shadow overflow-hidden group">
              <CardContent className="p-6">
                 <div className="flex items-center justify-between mb-4">
                    <div className={`h-10 w-10 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-xl flex items-center justify-center`}>
                        <stat.icon className={`h-5 w-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                    </div>
                    <Badge variant="outline" className="text-[10px] border-slate-100 dark:border-slate-800 flex items-center gap-1 font-bold">
                        <ArrowUp className="h-2.5 w-2.5 text-emerald-500" /> 12%
                    </Badge>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                    <p className="text-2xl font-black">{stat.value}</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">{stat.sub}</p>
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics & Queue Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <Card className="lg:col-span-8 rounded-[2rem] border-none hospital-shadow overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold">Queue Distribution</CardTitle>
                            <CardDescription className="text-xs">Real-time load across departments</CardDescription>
                        </div>
                        <div className="flex gap-2">
                             <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] uppercase">Normal</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="space-y-6">
                        {(analytics?.deptLoad || [
                            { dept: "Emergency", load: 0, color: "red", patients: 0 },
                            { dept: "Cardiology", load: 0, color: "blue", patients: 0 },
                            { dept: "General Medicine", load: 0, color: "teal", patients: 0 },
                            { dept: "Neurology", load: 0, color: "amber", patients: 0 },
                        ]).map((d: any) => (
                            <div key={d.dept} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-sm tracking-tight">{d.dept}</p>
                                        <span className="text-[10px] text-slate-400 font-medium">({d.patients} patients)</span>
                                    </div>
                                    <span className={`text-xs font-black text-${d.color}-600 dark:text-${d.color}-400`}>{d.load}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${d.load}%` }}
                                        className={`h-full bg-${d.color}-500 rounded-full`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="lg:col-span-4 rounded-[2rem] border-none hospital-shadow overflow-hidden">
                 <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
                    <CardTitle className="text-xl font-bold">Staff On Shift</CardTitle>
                    <CardDescription className="text-xs">Availability monitoring</CardDescription>
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {[
                            { name: "Dr. Emily Miller", role: "Cardiology", status: "Active" },
                            { name: "Dr. Marcus Chen", role: "Neurology", status: "Active" },
                            { name: "Dr. Sarah Johnson", role: "General", status: "Break" },
                            { name: "Dr. Robert Wilson", role: "Emergency", status: "Active" },
                        ].map((staff, i) => (
                            <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">
                                        {staff.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold">{staff.name}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{staff.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${staff.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    <span className="text-[10px] font-bold text-slate-500">{staff.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-6">
                        <Button variant="ghost" className="w-full rounded-xl text-indigo-600 dark:text-indigo-400 font-bold text-sm h-12">
                            View All Staff
                        </Button>
                    </div>
                 </CardContent>
            </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
