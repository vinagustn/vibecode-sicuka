import { redirect } from "next/navigation"
import { getCurrentSession } from "@/app/actions/auth"
import { db } from "@/lib/db"
import Navbar from "@/components/shared/Navbar"
import LeaveRequestForm from "@/components/leave/LeaveRequestForm"

export const metadata = {
  title: "Permohonan Cuti Baru - Si Cuka",
  description: "Ajukan permohonan cuti baru.",
}

export default async function NewLeaveRequestPage() {
  const session = await getCurrentSession()

  // Guard: Authenticated Only
  if (!session) {
    redirect("/login")
  }

  // Fetch employees (needed if logged in as admin to assign leave requests)
  const employees = await db.employee.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <div className="flex-1 flex flex-col">
      <Navbar session={session} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LeaveRequestForm employees={employees} session={session} />
      </main>
    </div>
  )
}
