import { signup } from '../login/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Link from 'next/link'
import { Stethoscope, AlertCircle, User, UserCog } from 'lucide-react'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params.error

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/30 mb-4">
            <Stethoscope className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create Account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Join the MediTriage health network</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form className="space-y-4" action={signup}>
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" name="full_name" required placeholder="Dr. John Doe or Jane Smith" className="bg-slate-50 dark:bg-slate-800" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="john@example.com" className="bg-slate-50 dark:bg-slate-800" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required className="bg-slate-50 dark:bg-slate-800" />
          </div>

          <div className="space-y-3 pt-2">
            <Label>I am a:</Label>
            <RadioGroup defaultValue="patient" name="role" className="grid grid-cols-2 gap-4">
              <div>
                <RadioGroupItem value="patient" id="patient" className="peer sr-only" />
                <Label
                  htmlFor="patient"
                  className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 peer-data-[state=checked]:border-teal-500 peer-data-[state=checked]:bg-teal-50 dark:peer-data-[state=checked]:bg-teal-900/10 transition-all cursor-pointer"
                >
                  <User className="mb-2 h-6 w-6 text-slate-500 peer-data-[state=checked]:text-teal-500" />
                  <span className="text-xs font-semibold">Patient</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="doctor" id="doctor" className="peer sr-only" />
                <Label
                  htmlFor="doctor"
                  className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 peer-data-[state=checked]:border-teal-500 peer-data-[state=checked]:bg-teal-50 dark:peer-data-[state=checked]:bg-teal-900/10 transition-all cursor-pointer"
                >
                  <UserCog className="mb-2 h-6 w-6 text-slate-500 peer-data-[state=checked]:text-teal-500" />
                  <span className="text-xs font-semibold">Doctor</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-6 h-auto mt-4 transition-all" type="submit">
            Sign Up
          </Button>
        </form>

        <div className="mt-8 text-center text-sm border-t border-slate-100 dark:border-slate-800 pt-6">
          <p className="text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-600 dark:text-teal-400 hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
