import { redirect } from "next/navigation"
import { getCurrentSession } from "@/app/actions/auth"
import Navbar from "@/components/shared/Navbar"
import EmployeeForm from "@/components/employee/EmployeeForm"

export const metadata = {
  title: "New Employee - Employee Leave Management System",
  description: "Register a new employee into the leave management system.",
}

export default async function NewEmployeePage() {
  const session = await getCurrentSession()

  // Guard: Authenticated & Admin Only
  if (!session) {
    redirect("/login")
  }

  if (session.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="flex-1 flex flex-col">
      <Navbar session={session} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmployeeForm />
      </main>
    </div>
  )
}
