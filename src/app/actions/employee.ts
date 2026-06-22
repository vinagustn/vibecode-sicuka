"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { EmployeeSchema, EmployeeEditSchema } from "@/validators"
import type { EmployeeInput, EmployeeEditInput } from "@/validators"
import { getCurrentSession } from "@/app/actions/auth"
import bcrypt from "bcryptjs"

// Determine role dynamically based on position
function getRoleForPosition(position: string): "APPROVER" | "REQUESTOR" {
  if (position === "Staff") return "REQUESTOR"
  return "APPROVER"
}

export async function getEmployees() {
  return db.employee.findMany({
    orderBy: { createdAt: "desc" },
  })
}

export async function getEmployeeById(id: string) {
  return db.employee.findUnique({
    where: { id },
  })
}

export async function createEmployee(data: EmployeeInput) {
  // Authorization check
  const session = await getCurrentSession()
  if (!session || session.role !== "ADMIN") {
    return { error: "Unauthorized. Admin role is required." }
  }

  const result = EmployeeSchema.safeParse(data)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const { name, department, position, username, password, leaveBalance } = result.data

  // 1. Check if name + department + position is duplicate
  const duplicate = await db.employee.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      department: { equals: department, mode: "insensitive" },
      position: { equals: position, mode: "insensitive" },
    },
  })

  if (duplicate) {
    return { error: "An employee with the same Name, Department, and Position already exists." }
  }

  // 2. Check if username is already taken
  const existingUsername = await db.employee.findUnique({
    where: { username },
  })

  if (existingUsername) {
    return { error: "Username is already taken by another employee." }
  }

  // Determine role
  const role = getRoleForPosition(position)

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  await db.employee.create({
    data: {
      name,
      department,
      position,
      role,
      username,
      password: hashedPassword,
      leaveBalance,
    },
  })

  revalidatePath("/employees")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function updateEmployee(id: string, data: EmployeeEditInput) {
  // Authorization check
  const session = await getCurrentSession()
  if (!session || session.role !== "ADMIN") {
    return { error: "Unauthorized. Admin role is required." }
  }

  const result = EmployeeEditSchema.safeParse(data)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const { name, department, position, username, password, leaveBalance } = result.data

  // 1. Check duplicate name + department + position excluding this employee
  const duplicate = await db.employee.findFirst({
    where: {
      id: { not: id },
      name: { equals: name, mode: "insensitive" },
      department: { equals: department, mode: "insensitive" },
      position: { equals: position, mode: "insensitive" },
    },
  })

  if (duplicate) {
    return { error: "An employee with the same Name, Department, and Position already exists." }
  }

  // 2. Check duplicate username excluding this employee
  const existingUsername = await db.employee.findFirst({
    where: {
      id: { not: id },
      username,
    },
  })

  if (existingUsername) {
    return { error: "Username is already taken." }
  }

  const role = getRoleForPosition(position)

  // Update object
  const updateData: any = {
    name,
    department,
    position,
    role,
    username,
    leaveBalance,
  }

  // If password was provided, hash and update it
  if (password && password.trim() !== "") {
    updateData.password = await bcrypt.hash(password, 10)
  }

  await db.employee.update({
    where: { id },
    data: updateData,
  })

  revalidatePath("/employees")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteEmployee(id: string) {
  // Authorization check
  const session = await getCurrentSession()
  if (!session || session.role !== "ADMIN") {
    return { error: "Unauthorized. Admin role is required." }
  }

  await db.employee.delete({
    where: { id },
  })

  revalidatePath("/employees")
  revalidatePath("/dashboard")
  return { success: true }
}
