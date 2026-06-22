"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ChevronLeft, CalendarPlus } from "lucide-react"
import Link from "next/link"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { LeaveRequestSchema, type LeaveRequestInput, getTodayAtMidnight } from "@/validators"
import { createLeaveRequest } from "@/app/actions/leave"
import type { UserSession } from "@/types"

interface LeaveRequestFormProps {
  employees: Array<{
    id: string
    name: string
    position: string
    leaveBalance: number
  }>
  session: UserSession
}

export default function LeaveRequestForm({ employees, session }: LeaveRequestFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const isUserEmployee = session.role !== "ADMIN"

  const form = useForm<LeaveRequestInput>({
    resolver: zodResolver(LeaveRequestSchema) as any,
    defaultValues: {
      employeeId: isUserEmployee ? session.id : "",
      startDate: undefined,
      endDate: undefined,
      reason: "",
    },
  })

  // Format date helper for input min values
  const getTodayString = () => {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, "0")
    const dd = String(today.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }

  const selectedEmployee = employees.find((e) => e.id === form.watch("employeeId"))

  const onSubmit = async (data: LeaveRequestInput) => {
    // Calculate leave days duration
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

    // Confirmation message prompt
    const hasConfirmed = window.confirm(`Apakah Anda yakin ingin mengajukan cuti selama ${diffDays} hari?`)
    if (!hasConfirmed) {
      return
    }

    setIsLoading(true)
    setServerError(null)

    try {
      const result = await createLeaveRequest(data)
      if (result.error) {
        setServerError(result.error)
        toast.error(result.error)
      } else {
        toast.success("Leave request submitted successfully!")
        router.push("/leave")
        router.refresh()
      }
    } catch {
      setServerError("An error occurred while submitting the request.")
      toast.error("An error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/leave"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-muted-foreground hover:text-foreground gap-1"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to directory</span>
        </Link>
      </div>

      <Card className="border-border shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-primary" />
            <span>Request Leave</span>
          </CardTitle>
          <CardDescription>
            Submit a new leave application. All fields are mandatory.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {serverError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">
                  {serverError}
                </div>
              )}

              {/* Remaining Leave Balance display */}
              {selectedEmployee && (
                <div className="p-3.5 rounded-lg border border-primary/20 bg-primary/5 text-sm flex items-center justify-between text-foreground">
                  <div>
                    <span className="font-semibold text-muted-foreground">Sisa Jatah Cuti ({selectedEmployee.name}):</span>
                  </div>
                  <div>
                    <span className="font-bold text-lg text-primary">{selectedEmployee.leaveBalance} hari</span>
                  </div>
                </div>
              )}

              {/* Employee Selection */}
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee / Karyawan</FormLabel>
                    {isUserEmployee ? (
                      <div className="p-2.5 rounded-lg border border-input bg-muted/40 text-sm font-semibold">
                        {session.name} ({session.position})
                      </div>
                    ) : (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background text-foreground">
                            <SelectValue placeholder="Select an employee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-card text-foreground">
                          {employees
                            .filter((e) => e.name !== "System Administrator")
                            .map((emp) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.name} ({emp.position})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Date */}
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <input
                          type="date"
                          min={getTodayString()}
                          className="flex h-8 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                          disabled={isLoading}
                          value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* End Date */}
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <input
                          type="date"
                          min={form.watch("startDate") ? new Date(form.watch("startDate")).toISOString().split("T")[0] : getTodayString()}
                          className="flex h-8 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                          disabled={isLoading}
                          value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Reason Text Area */}
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Leave</FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="Please state the reason for your leave request..."
                        disabled={isLoading}
                        rows={4}
                        className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-foreground resize-y min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t border-border pt-6">
              <Link
                href="/leave"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  isLoading && "pointer-events-none opacity-50"
                )}
              >
                Cancel
              </Link>
              <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                {isLoading ? "Submitting..." : "Submit Application"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
