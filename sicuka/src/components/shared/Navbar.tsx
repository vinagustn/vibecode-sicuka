"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, LogOut, LayoutDashboard, Users, CalendarDays, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "@/app/actions/auth"
import type { UserSession } from "@/types"

interface NavbarProps {
  session: UserSession
}

export default function Navbar({ session }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.refresh()
    router.push("/login")
  }

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "APPROVER", "REQUESTOR"],
    },
    {
      label: "Employees",
      href: "/employees",
      icon: Users,
      roles: ["ADMIN"],
    },
    {
      label: "Leave Requests",
      href: "/leave",
      icon: CalendarDays,
      roles: ["ADMIN", "APPROVER", "REQUESTOR"],
    },
  ]

  const activeClass = "bg-primary text-primary-foreground font-semibold"
  const inactiveClass = "text-muted-foreground hover:bg-muted hover:text-foreground"

  return (
    <nav className="border-b border-border bg-card shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Title */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-primary animate-pulse" />
              <span className="font-bold text-lg text-foreground tracking-tight bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                Si Cuka
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              {navItems
                .filter((item) => item.roles.includes(session.role))
                .map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        isActive ? activeClass : inactiveClass
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
            </div>

            {/* Profile info & Logout */}
            <div className="flex items-center gap-4 border-l border-border pl-6">
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground leading-none">{session.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {session.role === "ADMIN" ? "Administrator" : `${session.position} (${session.department})`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive gap-1.5"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 pt-2 pb-4 space-y-3 shadow-inner">
          <div className="space-y-1">
            {navItems
              .filter((item) => item.roles.includes(session.role))
              .map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base transition-all ${
                      isActive ? activeClass : inactiveClass
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
          </div>

          {/* Mobile Profile info & Logout */}
          <div className="border-t border-border pt-4 px-3 flex flex-col gap-3">
            <div>
              <p className="text-base font-semibold text-foreground">{session.name}</p>
              <p className="text-sm text-muted-foreground">
                {session.role === "ADMIN" ? "Administrator" : `${session.position} (${session.department})`}
              </p>
            </div>
            <Button
              variant="destructive"
              className="w-full justify-center gap-2 mt-1"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}
