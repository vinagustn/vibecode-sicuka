import { redirect } from "next/navigation"
import Link from "next/link"
import { CalendarRange, ClipboardList, CheckCircle, XCircle, Users, ArrowRight, UserPlus, PlusCircle } from "lucide-react"

import { getCurrentSession } from "@/app/actions/auth"
import { db } from "@/lib/db"
import Navbar from "@/components/shared/Navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Dashboard - Si Cuka",
  description: "Ikhtisar metrik cuti karyawan dan data statistik.",
}

export default async function DashboardPage() {
  const session = await getCurrentSession()

  // Guard: Redirect to login if unauthenticated
  if (!session) {
    redirect("/login")
  }

  const isManagement = session.role === "ADMIN" || session.role === "APPROVER"

  // Fetch metrics based on role
  let totalEmployees = 0
  let pendingCount = 0
  let approvedCount = 0
  let rejectedCount = 0

  if (isManagement) {
    // Management sees system-wide statistics
    totalEmployees = await db.employee.count({
      where: { username: { not: "admin" } },
    })
    pendingCount = await db.leaveRequest.count({
      where: { status: "PENDING" },
    })
    approvedCount = await db.leaveRequest.count({
      where: { status: "APPROVED" },
    })
    rejectedCount = await db.leaveRequest.count({
      where: { status: "REJECTED" },
    })
  } else {
    // Requestor sees personal statistics
    pendingCount = await db.leaveRequest.count({
      where: { employeeId: session.id, status: "PENDING" },
    })
    approvedCount = await db.leaveRequest.count({
      where: { employeeId: session.id, status: "APPROVED" },
    })
    rejectedCount = await db.leaveRequest.count({
      where: { employeeId: session.id, status: "REJECTED" },
    })
  }

  // Fetch recent activities
  const recentRequests = await db.leaveRequest.findMany({
    where: isManagement ? undefined : { employeeId: session.id },
    include: { employee: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  return (
    <div className="flex-1 flex flex-col">
      <Navbar session={session} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl border border-slate-800 text-slate-100 shadow-lg">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {session.name}!
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {session.role === "ADMIN"
                ? "Manage system employee records and oversee global leave requests."
                : `Active role: ${session.position} in the ${session.department} Department.`}
            </p>
          </div>
          <div className="flex gap-2">
            {session.role === "ADMIN" && (
              <Link
                href="/employees/new"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "border-slate-700 hover:bg-slate-800 text-slate-100 gap-2"
                )}
              >
                <UserPlus className="h-4 w-4" />
                <span>Add Employee</span>
              </Link>
            )}
            {session.role !== "ADMIN" && (
              <Link
                href="/leave/new"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2"
                )}
              >
                <PlusCircle className="h-4 w-4" />
                <span>Request Leave</span>
              </Link>
            )}
          </div>
        </section>

        {/* Metrics Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isManagement && (
            <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
                <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  <Users className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEmployees}</div>
                <p className="text-xs text-muted-foreground mt-1">Excludes admin account</p>
              </CardContent>
            </Card>
          )}

          <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isManagement ? "Pending Requests" : "My Pending Leaves"}
              </CardTitle>
              <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <ClipboardList className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval decision</p>
            </CardContent>
          </Card>

          <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isManagement ? "Approved Requests" : "My Approved Leaves"}
              </CardTitle>
              <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully approved</p>
            </CardContent>
          </Card>

          <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isManagement ? "Rejected Requests" : "My Rejected Leaves"}
              </CardTitle>
              <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                <XCircle className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Declined requests</p>
            </CardContent>
          </Card>
        </section>

        {/* Recent Activity Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-slate-100 dark:border-slate-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Leave Activity</CardTitle>
                <CardDescription>
                  {isManagement
                    ? "Latest leave requests submitted across the portal."
                    : "Overview of your recent leave requests."}
                </CardDescription>
              </div>
              <Link
                href="/leave"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "gap-1"
                )}
              >
                <span>View All</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No leave requests found.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentRequests.map((req) => {
                    const startStr = new Date(req.startDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                    const endStr = new Date(req.endDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })

                    // Calculate duration in days
                    const diffTime = Math.abs(new Date(req.endDate).getTime() - new Date(req.startDate).getTime())
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

                    let statusBadge = "bg-slate-100 text-slate-700"
                    if (req.status === "PENDING") statusBadge = "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                    else if (req.status === "APPROVED") statusBadge = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                    else if (req.status === "REJECTED") statusBadge = "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400"

                    return (
                      <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 first:pt-0 last:pb-0">
                        <div>
                          <p className="font-semibold text-sm">
                            {isManagement ? req.employee.name : "Leave Request"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {startStr} — {endStr} ({diffDays} hari)
                          </p>
                          <p className="text-xs text-slate-500 italic mt-1 max-w-md truncate">
                            &ldquo;{req.reason}&rdquo;
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide ${statusBadge}`}>
                            {req.status}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-lg">Information & Policy</CardTitle>
              <CardDescription>Leave System Guidelines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm flex-1">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg space-y-1">
                <p className="font-semibold text-xs text-slate-500 uppercase tracking-wider">Approval Hierarchy</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  Only employees with higher position levels can approve leave requests.
                  General Managers (Level 5) and Department Heads (Level 4) can oversee lower management and staff.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg space-y-1">
                <p className="font-semibold text-xs text-slate-500 uppercase tracking-wider">Validation Rules</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4 mt-1">
                  <li>Leave start date must be today or in the future.</li>
                  <li>End date must be greater than or equal to the start date.</li>
                  <li>All fields in forms must be fully filled out.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
