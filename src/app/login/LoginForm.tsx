"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { KeyRound, User, LogIn } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoginSchema, type LoginInput } from "@/validators"
import { login } from "@/app/actions/auth"

export default function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    setServerError(null)

    const formData = new FormData()
    formData.append("username", data.username)
    formData.append("password", data.password)

    try {
      const result = await login(null, formData)
      if (result?.error) {
        setServerError(result.error)
        toast.error(result.error)
      } else {
        toast.success("Welcome back!")
        router.refresh()
        router.push("/dashboard")
      }
    } catch (err) {
      setServerError("An unexpected error occurred.")
      toast.error("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full bg-white text-slate-800 shadow-xl rounded-2xl overflow-hidden border border-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left Column: Image/Illustration */}
        <div className="hidden md:flex flex-col items-center justify-center p-8 bg-slate-50/50 border-r border-slate-100">
          <img
            src="/login_illustration.jpg"
            alt="Si Cuka Illustration"
            className="max-h-[350px] w-auto object-contain rounded-xl opacity-90"
          />
        </div>
        
        {/* Right Column: Form */}
        <div className="flex flex-col justify-center p-8 md:p-12 space-y-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Sign In
            </h2>
            <p className="text-slate-500 text-sm">
              Sistem Cuti Karyawan — Kelola dan ajukan permohonan cuti Anda dengan mudah.
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">
                {serverError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="username-input" className="text-slate-600">Username</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <Input
                  id="username-input"
                  type="text"
                  placeholder="Username"
                  className="pl-9 border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus-visible:border-primary focus-visible:ring-primary/20"
                  disabled={isLoading}
                  {...register("username")}
                />
              </div>
              {errors.username && (
                <p id="username-error" className="text-xs font-semibold text-destructive">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password-input" className="text-slate-600">Password</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <KeyRound className="h-4 w-4" />
                </span>
                <Input
                  id="password-input"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus-visible:border-primary focus-visible:ring-primary/20"
                  disabled={isLoading}
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p id="password-error" className="text-xs font-semibold text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              id="login-submit-button"
              type="submit"
              className="w-full justify-center bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 transition-all mt-2"
              disabled={isLoading}
            >
              <LogIn className="h-4 w-4" />
              <span>{isLoading ? "Signing in..." : "Sign In"}</span>
            </Button>
          </form>

          <div className="border-t border-slate-100 pt-4 text-center">
            <Link
              href="/code-review"
              className="text-xs text-primary hover:underline font-medium hover:text-primary/90"
            >
              Lihat Laporan Code Review & Standar Keamanan
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
