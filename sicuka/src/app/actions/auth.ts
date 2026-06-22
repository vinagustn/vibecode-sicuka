"use server"

import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { LoginSchema } from "@/validators"
import type { UserSession, Role, Position } from "@/types"
import { encrypt, decrypt } from "@/lib/session"
import bcrypt from "bcryptjs"

export async function login(prevState: any, formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  const result = LoginSchema.safeParse({ username, password })
  if (!result.success) {
    return { error: "Username and password are required" }
  }

  // Find employee in database
  const employee = await db.employee.findUnique({
    where: { username: result.data.username },
  })

  // Compare hashed password
  if (!employee || !(await bcrypt.compare(result.data.password, employee.password))) {
    return { error: "Invalid username or password" }
  }

  // Create session
  const session: UserSession = {
    id: employee.id,
    name: employee.name,
    username: employee.username,
    role: employee.role as Role,
    position: employee.position as Position,
    department: employee.department,
  }

  const cookieStore = await cookies()
  cookieStore.set("session", encrypt(JSON.stringify(session)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  })

  return { success: true }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
  return { success: true }
}

export async function getCurrentSession(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("session")
  if (!sessionCookie) return null

  try {
    const decrypted = decrypt(sessionCookie.value)
    if (!decrypted) return null
    return JSON.parse(decrypted) as UserSession
  } catch {
    return null
  }
}

// Quick login server action for testing (now also encrypts session)
export async function loginAs(employeeId: string) {
  const employee = await db.employee.findUnique({
    where: { id: employeeId },
  })

  if (!employee) {
    return { error: "Employee not found" }
  }

  const session: UserSession = {
    id: employee.id,
    name: employee.name,
    username: employee.username,
    role: employee.role as Role,
    position: employee.position as Position,
    department: employee.department,
  }

  const cookieStore = await cookies()
  cookieStore.set("session", encrypt(JSON.stringify(session)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  })

  return { success: true }
}
