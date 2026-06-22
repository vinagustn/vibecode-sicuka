import { redirect } from "next/navigation"
import { getCurrentSession } from "@/app/actions/auth"
import { db } from "@/lib/db"
import Navbar from "@/components/shared/Navbar"
import EmployeeListTable from "./EmployeeListTable"

export const metadata = {
  title: "Daftar Karyawan - Si Cuka",
  description: "Kelola data karyawan dan jatah cuti mereka.",
}

export default async function EmployeesPage() {
  const session = await getCurrentSession()

  // Guard: Authenticated & Admin Only
  if (!session) {
    redirect("/login")
  }

  if (session.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // Fetch employees
  const employees = await db.employee.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <div className="flex-1 flex flex-col">
      <Navbar session={session} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <EmployeeListTable initialEmployees={employees} />
      </main>
    </div>
  )
}
