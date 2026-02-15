import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

const messages: Record<string, string> = {
  invalid_credentials: "Invalid email or password. Please try again.",
  invalid_role: "Account role is invalid. Contact support or sign up again.",
  signup_failed: "Sign-up failed. Please verify details and try again.",
}

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const params = await searchParams
  const key = params.message || "default"
  const detail = messages[key] || "Something went wrong while processing your request."

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-border/40 bg-card/50 p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/15">
          <AlertTriangle className="h-6 w-6 text-red-400" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">Action Failed</h1>
        <p className="mb-6 text-sm text-muted-foreground">{detail}</p>
        <div className="flex justify-center gap-2">
          <Link href="/login">
            <Button>Back to Login</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
