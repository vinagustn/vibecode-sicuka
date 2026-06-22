import { z } from "zod"

export const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

export const EmployeeSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  department: z.string().min(1, "Department is required"),
  position: z.enum(["Staff", "Team Lead", "Manager", "Department Head", "General Manager"], {
    message: "Position is required",
  }),
  username: z.string().min(3, "Username must be at least 3 characters").toLowerCase().trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  leaveBalance: z.coerce.number().int().nonnegative("Leave balance must be non-negative"),
})

export const EmployeeEditSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  department: z.string().min(1, "Department is required"),
  position: z.enum(["Staff", "Team Lead", "Manager", "Department Head", "General Manager"], {
    message: "Position is required",
  }),
  username: z.string().min(3, "Username must be at least 3 characters").toLowerCase().trim(),
  password: z.string().optional().or(z.literal("")), // optional during edit
  leaveBalance: z.coerce.number().int().nonnegative("Leave balance must be non-negative"),
})

// Helper to get today at midnight
export const getTodayAtMidnight = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export const LeaveRequestSchema = z
  .object({
    employeeId: z.string().min(1, "Employee is required"),
    startDate: z.coerce.date().refine((date) => {
      const today = getTodayAtMidnight()
      return date >= today
    }, {
      message: "Start date must be today or in the future",
    }),
    endDate: z.coerce.date(),
    reason: z.string().min(1, "Reason is required"),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be greater than or equal to start date",
    path: ["endDate"],
  })

export type LoginInput = z.infer<typeof LoginSchema>
export type EmployeeInput = z.infer<typeof EmployeeSchema>
export type EmployeeEditInput = z.infer<typeof EmployeeEditSchema>
export type LeaveRequestInput = z.infer<typeof LeaveRequestSchema>
