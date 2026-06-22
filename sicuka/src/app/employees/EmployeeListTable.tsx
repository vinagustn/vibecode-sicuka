"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Search, UserPlus, Edit2, Trash2, ShieldCheck, ShieldAlert } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { deleteEmployee } from "@/app/actions/employee"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Employee {
  id: string
  name: string
  department: string
  position: string
  role: string
  username: string
}

interface EmployeeListTableProps {
  initialEmployees: Employee[]
}

export default function EmployeeListTable({ initialEmployees }: EmployeeListTableProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [searchTerm, setSearchTerm] = useState("")
  const [isPending, startTransition] = useTransition()

  // Deletion modal state
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteClick = (emp: Employee) => {
    // Prevent deleting the system admin
    if (emp.username === "admin") {
      toast.error("The system administrator account cannot be deleted.")
      return
    }
    setEmployeeToDelete(emp)
  }

  const handleConfirmDelete = () => {
    if (!employeeToDelete) return

    startTransition(async () => {
      try {
        const result = await deleteEmployee(employeeToDelete.id)
        if (result.success) {
          toast.success(`Successfully deleted ${employeeToDelete.name}`)
          setEmployees(employees.filter((e) => e.id !== employeeToDelete.id))
        } else {
          toast.error("Failed to delete employee.")
        }
      } catch {
        toast.error("Failed to delete employee.")
      } finally {
        setEmployeeToDelete(null)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Employee Directory</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Search, modify, or remove employee records in the leave system.
          </p>
        </div>
        <Link
          href="/employees/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold self-start sm:self-auto gap-2"
          )}
        >
          <UserPlus className="h-4 w-4" />
          <span>New Employee</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
          <Search className="h-4 w-4" />
        </span>
        <Input
          type="text"
          placeholder="Search employees by name..."
          className="pl-9 border-border bg-card text-foreground focus-visible:border-primary focus-visible:ring-primary/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Directory Table */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-semibold uppercase tracking-wider text-xs border-b border-border">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                    No employees found matching &quot;{searchTerm}&quot;.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const isAdmin = emp.role === "ADMIN"
                  const isApprover = emp.role === "APPROVER"

                  let roleBadge = "bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-400"
                  if (isAdmin) roleBadge = "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                  else if (isApprover) roleBadge = "bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400"

                  return (
                    <tr key={emp.id} className="hover:bg-muted/20 transition-all duration-150">
                      <td className="px-6 py-4 font-semibold">{emp.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{emp.username}</td>
                      <td className="px-6 py-4">{emp.department}</td>
                      <td className="px-6 py-4 font-medium">{emp.position}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${roleBadge}`}>
                          {isAdmin ? <ShieldAlert className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                          <span>{emp.role}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <Link
                          href={`/employees/edit/${emp.id}`}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon" }),
                            "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteClick(emp)}
                          disabled={emp.username === "admin"}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!employeeToDelete} onOpenChange={(open) => !open && setEmployeeToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold">{employeeToDelete?.name}</span>? 
              This action cannot be undone and will delete all their leave requests.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setEmployeeToDelete(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
