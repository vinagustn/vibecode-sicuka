import { redirect } from "next/navigation"
import { getCurrentSession } from "@/app/actions/auth"
import { db } from "@/lib/db"
import Navbar from "@/components/shared/Navbar"
import LeaveListTable from "./LeaveListTable"

export const metadata = {
  title: "Pengajuan Cuti - Si Cuka",
  description: "Kelola pengajuan cuti karyawan.",
}

export default async function LeaveRequestsPage() {
  const session = await getCurrentSession()

  // Guard: Authenticated Only
  if (!session) {
    redirect("/login")
  }

  // Fetch leave requests including employee data
  const requests = await db.leaveRequest.findMany({
    include: {
      employee: true,
    },
    orderBy: { createdAt: "desc" },
  })

  // Filter based on role
  let filteredRequests = requests
  if (session.role === "REQUESTOR") {
    // Requestors only see their own requests
    filteredRequests = requests.filter((r) => r.employeeId === session.id)
  }

  return (
    <div className="flex-1 flex flex-col">
      <Navbar session={session} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <LeaveListTable initialRequests={filteredRequests} session={session} />
      </main>
    </div>
  )
}
