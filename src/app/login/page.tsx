import { redirect } from "next/navigation"
import { getCurrentSession } from "@/app/actions/auth"
import LoginForm from "./LoginForm"

export const metadata = {
  title: "Login - Si Cuka",
  description: "Secure login portal. Enter your credentials.",
}

export default async function LoginPage() {
  const session = await getCurrentSession()

  // If already logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-4xl">
        <LoginForm />
      </div>
    </main>
  )
}
