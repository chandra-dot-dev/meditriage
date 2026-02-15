"use client"

import { DashboardShell } from "@/components/shared/DashboardShell"
import { 
  BarChart3, 
  Users, 
  Settings, 
  ShieldAlert,
  Brain,
  Lock,
  Globe,
  Bell,
  Save
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

const navItems = [
  { label: "Overview", href: "/admin", icon: BarChart3 },
  { label: "Manage Doctors", href: "/admin/doctors", icon: Users },
  { label: "Emergency Monitoring", href: "/admin/emergency", icon: ShieldAlert },
  { label: "System Config", href: "/admin/settings", icon: Settings },
]

export default function AdminSettingsPage() {
  return (
    <DashboardShell role="admin" navItems={navItems} userName="Admin">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
            <h1 className="text-3xl font-extrabold tracking-tight">System Configuration</h1>
            <p className="text-slate-500 text-sm">Manage triage algorithm thresholds, platform security, and notification systems.</p>
        </div>

        <div className="grid gap-6">
            <Card className="rounded-[2rem] border-none hospital-shadow">
                <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                            <Brain className="h-5 w-5 text-indigo-600" />
                        </div>
                        <CardTitle className="text-lg font-bold">AI Triage Parameters</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label className="font-bold">Real-time Risk Recalculation</Label>
                            <p className="text-xs text-slate-500 font-medium">Auto-adjust patient priority based on new symptom weightings.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="space-y-4">
                        <Label className="font-bold">Minimum Confidence Threshold (%)</Label>
                        <Input type="number" defaultValue={85} className="rounded-xl bg-slate-50 h-12 max-w-[200px]" />
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-none hospital-shadow">
                <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <Globe className="h-5 w-5 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg font-bold">Locale & Language</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <Label className="font-bold">Default Timezone</Label>
                            <Input defaultValue="UTC (GMT+0)" className="rounded-xl bg-slate-50" />
                         </div>
                         <div className="space-y-2">
                            <Label className="font-bold">Primary Language</Label>
                            <Input defaultValue="English (US)" className="rounded-xl bg-slate-50" />
                         </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
                <Button variant="outline" className="rounded-xl px-8 h-12 font-bold">Discard Changes</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-12 h-12 font-bold shadow-lg shadow-indigo-500/20">
                    <Save className="h-4 w-4 mr-2" /> Save Configuration
                </Button>
            </div>
        </div>
      </div>
    </DashboardShell>
  )
}
