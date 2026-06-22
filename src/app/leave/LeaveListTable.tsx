"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { CalendarDays, Filter, PlusCircle, Check, X, ShieldAlert } from "lucide-react"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { updateLeaveRequestStatus } from "@/app/actions/leave"
import type { UserSession } from "@/types"

interface Employee {
  id: string
  name: string
  department: string
  position: string
  role: string
}

interface LeaveRequest {
  id: string
  employeeId: string
  startDate: Date
  endDate: Date
  reason: string
  status: string
  createdAt: Date
  employee: Employee
}

interface LeaveListTableProps {
  initialRequests: LeaveRequest[]
  session: UserSession
}

const positionLevels: Record<string, number> = {
  "Staff": 1,
  "Team Lead": 2,
  "Manager": 3,
  "Department Head": 4,
  "General Manager": 5,
}

export default function LeaveListTable({ initialRequests, session }: LeaveListTableProps) {
  const [requests, setRequests] = useState<LeaveRequest[]>(initialRequests)
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL")
  const [isPending, startTransition] = useTransition()

  const handleStatusUpdate = (requestId: string, status: "APPROVED" | "REJECTED") => {
    startTransition(async () => {
      try {
        const result = await updateLeaveRequestStatus(requestId, status)
        if (result.success) {
          toast.success(`Request status updated to ${status}`)
          setRequests(
            requests.map((r) => (r.id === requestId ? { ...r, status } : r))
          )
        } else {
          toast.error(result.error ?? "Failed to update request status.")
        }
      } catch {
        toast.error("An error occurred.")
      }
    })
  }

  const filteredRequests = requests.filter(
    (req) => filter === "ALL" || req.status === filter
  )

  const loggedInLevel = positionLevels[session.position] || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Leave Requests</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {session.role === "REQUESTOR"
              ? "Track your submitted leave requests and their statuses."
              : "Review and approve/reject employee leave applications."}
          </p>
        </div>
        {session.role !== "ADMIN" && (
          <Link
            href="/leave/new"
            className={cn(
              buttonVariants({ variant: "default" }),
              "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold self-start sm:self-auto gap-2"
            )}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Request Leave</span>
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2 flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5" />
          <span>Filter Status:</span>
        </span>
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter(status)}
            className="rounded-full text-xs"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Requests Directory */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-semibold uppercase tracking-wider text-xs border-b border-border">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                {session.role !== "REQUESTOR" && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={session.role === "REQUESTOR" ? 6 : 7} className="px-6 py-10 text-center text-muted-foreground">
                    No leave requests found in this category.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
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

                  // Duration calculations
                  const diffTime = Math.abs(new Date(req.endDate).getTime() - new Date(req.startDate).getTime())
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

                  // Status badge styling
                  let statusBadge = "bg-slate-100 text-slate-700"
                  if (req.status === "PENDING") statusBadge = "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                  else if (req.status === "APPROVED") statusBadge = "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                  else if (req.status === "REJECTED") statusBadge = "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400"

                  // Authorization check for approving
                  const requestorLevel = positionLevels[req.employee.position] || 0
                  const isPendingStatus = req.status === "PENDING"
                  const canApprove =
                    session.role === "ADMIN" ||
                    (session.role === "APPROVER" && loggedInLevel > requestorLevel)

                  // Prevent self-approval (an employee cannot approve their own leave request)
                  const isSelfRequest = req.employeeId === session.id
                  const finalCanApprove = canApprove && !isSelfRequest

                  return (
                    <tr key={req.id} className="hover:bg-muted/20 transition-all duration-150">
                      <td className="px-6 py-4 font-semibold">{req.employee.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{req.employee.position}</td>
                      <td className="px-6 py-4 font-medium whitespace-nowrap">
                        {startStr} — {endStr}
                      </td>
                      <td className="px-6 py-4">{diffDays} hari</td>
                      <td className="px-6 py-4 max-w-xs truncate" title={req.reason}>
                        {req.reason}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${statusBadge}`}>
                          {req.status}
                        </span>
                      </td>

                      {/* Management Action Columns */}
                      {session.role !== "REQUESTOR" && (
                        <td className="px-6 py-4 text-right whitespace-nowrap space-x-1.5">
                          {isPendingStatus ? (
                            finalCanApprove ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                  onClick={() => handleStatusUpdate(req.id, "APPROVED")}
                                  disabled={isPending}
                                  title="Approve request"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                  onClick={() => handleStatusUpdate(req.id, "REJECTED")}
                                  disabled={isPending}
                                  title="Reject request"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground flex items-center justify-end gap-1.5 italic" title={isSelfRequest ? "Cannot approve your own request" : "Insufficient position level to approve this request"}>
                                <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                                <span className="text-[11px]">{isSelfRequest ? "Self Request" : "No Permission"}</span>
                              </span>
                            )
                          ) : (
                            <span className="text-xs text-slate-400 italic">Processed</span>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
