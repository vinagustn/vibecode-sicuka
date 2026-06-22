"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { LeaveRequestSchema } from "@/validators"
import type { LeaveRequestInput } from "@/validators"
import { getCurrentSession } from "@/app/actions/auth"

export async function getLeaveRequests() {
  return db.leaveRequest.findMany({
    include: {
      employee: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function createLeaveRequest(data: LeaveRequestInput) {
  const session = await getCurrentSession()
  if (!session) {
    return { error: "Unauthorized. Please log in." }
  }

  const result = LeaveRequestSchema.safeParse(data)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const { employeeId, startDate, endDate, reason } = result.data

  // Prevent submitting on behalf of others unless Admin
  if (session.role !== "ADMIN" && employeeId !== session.id) {
    return { error: "Forbidden. You cannot submit leave requests for another employee." }
  }

  // Calculate requested days
  const timeDiff = endDate.getTime() - startDate.getTime()
  const requestedDays = Math.round(timeDiff / (1000 * 60 * 60 * 24)) + 1

  try {
    await db.$transaction(async (tx) => {
      const employee = await tx.employee.findUnique({
        where: { id: employeeId },
      })

      if (!employee) {
        throw new Error("Employee not found.")
      }

      if (employee.leaveBalance <= 0) {
        throw new Error("Jatah cuti Anda sudah habis (0 hari). Anda tidak dapat mengajukan cuti.")
      }

      if (employee.leaveBalance < requestedDays) {
        throw new Error(`Sisa cuti tidak mencukupi. Sisa cuti: ${employee.leaveBalance} hari, diajukan: ${requestedDays} hari.`)
      }

      // Decrement employee leave balance
      await tx.employee.update({
        where: { id: employeeId },
        data: {
          leaveBalance: employee.leaveBalance - requestedDays,
        },
      })

      // Create leave request
      await tx.leaveRequest.create({
        data: {
          employeeId,
          startDate,
          endDate,
          reason,
          status: "PENDING",
        },
      })
    })

    revalidatePath("/leave")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to create leave request." }
  }
}

export async function updateLeaveRequestStatus(id: string, status: "APPROVED" | "REJECTED") {
  if (status !== "APPROVED" && status !== "REJECTED") {
    return { error: "Invalid status value" }
  }

  const session = await getCurrentSession()
  if (!session) {
    return { error: "Unauthorized. Please log in." }
  }

  try {
    await db.$transaction(async (tx) => {
      const request = await tx.leaveRequest.findUnique({
        where: { id },
        include: { employee: true },
      })

      if (!request) {
        throw new Error("Leave request not found.")
      }

      // Authorization & hierarchy check inside server logic
      if (session.role !== "ADMIN") {
        if (session.role !== "APPROVER") {
          throw new Error("Forbidden. You do not have permission to approve leave requests.")
        }

        // Prevent self-approval
        if (request.employeeId === session.id) {
          throw new Error("Forbidden. You cannot approve or reject your own leave request.")
        }

        const positionLevels: Record<string, number> = {
          "Staff": 1,
          "Team Lead": 2,
          "Manager": 3,
          "Department Head": 4,
          "General Manager": 5,
        }

        const loggedInLevel = positionLevels[session.position] || 0
        const requestorLevel = positionLevels[request.employee.position] || 0

        if (loggedInLevel <= requestorLevel) {
          throw new Error("Forbidden. You do not have permission to approve/reject requests from this position level.")
        }
      }

      if (request.status === status) {
        return
      }

      // Refund leave balance if transitioning from PENDING to REJECTED
      if (status === "REJECTED" && request.status === "PENDING") {
        const timeDiff = request.endDate.getTime() - request.startDate.getTime()
        const requestedDays = Math.round(timeDiff / (1000 * 60 * 60 * 24)) + 1

        await tx.employee.update({
          where: { id: request.employeeId },
          data: {
            leaveBalance: request.employee.leaveBalance + requestedDays,
          },
        })
      }

      await tx.leaveRequest.update({
        where: { id },
        data: { status },
      })
    })

    revalidatePath("/leave")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to update leave request status." }
  }
}
