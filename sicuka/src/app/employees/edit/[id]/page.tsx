import { redirect, notFound } from "next/navigation"
import { getCurrentSession } from "@/app/actions/auth"
import { db } from "@/lib/db"
import Navbar from "@/components/shared/Navbar"
import EmployeeForm from "@/components/employee/EmployeeForm"

export const metadata = {
  title: "Ubah Data Karyawan - Si Cuka",
  description: "Ubah informasi data karyawan.",
}

type Params = Promise<{ id: string }>

interface EditEmployeePageProps {
  params: Params
}

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  const session = await getCurrentSession()
  const { id } = await params

  // Guard: Authenticated & Admin Only
  if (!session) {
    redirect("/login")
  }

  if (session.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // Fetch employee record
  const employee = await db.employee.findUnique({
    where: { id },
  })

  if (!employee) {
    notFound()
  }

  return (
    <div className="flex-1 flex flex-col">
      <Navbar session={session} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmployeeForm initialData={employee} />
      </main>
    </div>
  )
}
