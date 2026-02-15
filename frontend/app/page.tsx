"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Stethoscope, 
  Activity, 
  ShieldCheck, 
  Clock, 
  Globe, 
  ChevronRight, 
  Brain, 
  Users,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useLanguage } from "@/components/LanguageProvider"

export default function LandingPage() {
  const { t } = useLanguage()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">MediTriage</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link href="#features" className="hover:text-teal-600 transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-teal-600 transition-colors">How it Works</Link>
            <Link href="#about" className="hover:text-teal-600 transition-colors">About</Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden sm:flex">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-xs font-bold mb-6 border border-teal-100 dark:border-teal-800">
              <Brain className="h-3 w-3" />
              <span>AI-Powered Clinical Decision Support</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
              Revolutionizing <span className="gradient-text">Hospital Triage</span> with Intelligence.
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-xl leading-relaxed">
              MediTriage uses advanced ML models to classify patient risk in seconds, ensuring critical cases get immediate attention while optimizing clinical workflow for doctors and staff.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-7 h-auto text-lg rounded-xl shadow-lg shadow-teal-500/20 transition-all hover:translate-y-[-2px]">
                  Sign Up as Patient <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="px-8 py-7 h-auto text-lg rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                  Join as Staff
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-6 text-slate-400 dark:text-slate-600">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">99.8%</span>
                <span className="text-xs uppercase tracking-wider font-semibold">Uptime</span>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">15s</span>
                <span className="text-xs uppercase tracking-wider font-semibold">Avg Triage</span>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">50k+</span>
                <span className="text-xs uppercase tracking-wider font-semibold">Cases Analyzed</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square bg-gradient-to-tr from-teal-500/20 to-blue-500/10 rounded-full absolute -inset-4 blur-3xl animate-pulse" />
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400 animate-ping" />
                  <span className="text-xs font-bold text-slate-500 uppercase">Live Risk Queue</span>
                </div>
                <Users className="h-4 w-4 text-slate-400" />
              </div>
              
              <div className="space-y-4">
                {[
                  { name: "Sarah J.", risk: "High", dept: "Cardiology", time: "2m ago" },
                  { name: "Michael R.", risk: "Medium", dept: "General", time: "5m ago" },
                  { name: "David L.", risk: "Low", dept: "Dermatology", time: "12m ago" },
                ].map((p, i) => (
                  <div key={i} className="bg-white/50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-all hover:bg-white dark:hover:bg-slate-900">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400">
                        {p.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{p.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{p.dept}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md mb-1 inline-block ${
                        p.risk === 'High' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 
                        p.risk === 'Medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 
                        'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
                      }`}>
                        {p.risk} Priority
                      </span>
                      <p className="text-[10px] text-slate-400">{p.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Clinical Features</h2>
            <p className="text-slate-500 max-w-2xl mx-auto underline decoration-teal-500/30 decoration-2 underline-offset-4">Everything you need to manage patient flow efficiently from intake to discharge.</p>
          </div>

          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { 
                icon: Activity, 
                title: "Predictive Analytics", 
                desc: "Integrated ML models analyze vitals and symptoms to provide high-confidence risk scoring." 
              },
              { 
                icon: Clock, 
                title: "Real-time Queue", 
                desc: "Patients see their live position and estimated wait times, reducing anxiety and portal lag." 
              },
              { 
                icon: ShieldCheck, 
                title: "HIPAA Compliant", 
                desc: "Built with security-first architecture. All patient data is encrypted and handled with clinical care." 
              },
              { 
                icon: Globe, 
                title: "Multi-language Support", 
                desc: "Communicate triage results in the patient's native language using AI translation services." 
              },
              { 
                icon: Brain, 
                title: "AI Medical Consultant", 
                desc: "24/7 AI chat for patients to describe symptoms and receive immediate triage guidance." 
              },
              { 
                icon: CheckCircle2, 
                title: "Role-Based Logic", 
                desc: "Tailored dashboards for Patients, Doctors, and Admins to streamline their specific workflows." 
              },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                variants={item}
                className="bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all hover:border-teal-500/50 hover:shadow-xl group"
              >
                <div className="h-12 w-12 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 overflow-hidden relative">
        <div className="max-w-4xl mx-auto bg-teal-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl" />
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to upgrade your hospital's efficiency?</h2>
          <p className="text-teal-50 mb-10 text-lg opacity-90 max-w-2xl mx-auto">
            Join hundreds of healthcare providers already using MediTriage to save time and lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-teal-50 px-10 py-7 h-auto text-lg rounded-xl font-bold shadow-2xl">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-teal-600 rounded flex items-center justify-center">
              <Stethoscope className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">MediTriage</span>
          </div>
          
          <p className="text-slate-500 dark:text-slate-500 text-sm">
            © 2026 MediTriage Systems. All rights reserved. Clinical Triage Platform.
          </p>

          <div className="flex items-center gap-6">
            <Link href="#" className="text-slate-400 hover:text-teal-600 transition-colors"><ShieldCheck className="h-5 w-5" /></Link>
            <Link href="#" className="text-slate-400 hover:text-teal-600 transition-colors"><Globe className="h-5 w-5" /></Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
