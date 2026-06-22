"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ChevronLeft, UserPlus, Save } from "lucide-react"
import Link from "next/link"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { EmployeeSchema, EmployeeEditSchema } from "@/validators"
import type { EmployeeInput, EmployeeEditInput } from "@/validators"
import { createEmployee, updateEmployee } from "@/app/actions/employee"

interface EmployeeFormProps {
  initialData?: {
    id: string
    name: string
    department: string
    position: string
    username: string
    leaveBalance: number
  }
}

type EmployeeFormInput = {
  name: string
  department: string
  position: "Staff" | "Team Lead" | "Manager" | "Department Head" | "General Manager"
  username: string
  password?: string
  leaveBalance: number
}

export default function EmployeeForm({ initialData }: EmployeeFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const isEditMode = !!initialData

  // Choose schema based on mode
  const currentSchema = isEditMode ? EmployeeEditSchema : EmployeeSchema

  const form = useForm<EmployeeFormInput>({
    resolver: zodResolver(currentSchema) as any,
    defaultValues: {
      name: initialData?.name ?? "",
      department: initialData?.department ?? "",
      position: (initialData?.position as any) ?? "",
      username: initialData?.username ?? "",
      password: "", // empty by default
      leaveBalance: initialData?.leaveBalance ?? 12,
    },
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    setServerError(null)

    try {
      if (isEditMode && initialData) {
        const result = await updateEmployee(initialData.id, data as EmployeeEditInput)
        if (result.error) {
          setServerError(result.error)
          toast.error(result.error)
        } else {
          toast.success("Employee updated successfully!")
          router.push("/employees")
          router.refresh()
        }
      } else {
        const result = await createEmployee(data as EmployeeInput)
        if (result.error) {
          setServerError(result.error)
          toast.error(result.error)
        } else {
          toast.success("Employee created successfully!")
          router.push("/employees")
          router.refresh()
        }
      }
    } catch {
      setServerError("An error occurred while saving the employee record.")
      toast.error("An error occurred while saving.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/employees"
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
            {isEditMode ? <Save className="h-5 w-5 text-primary" /> : <UserPlus className="h-5 w-5 text-primary" />}
            <span>{isEditMode ? "Edit Employee Record" : "Add New Employee"}</span>
          </CardTitle>
          <CardDescription>
            {isEditMode
              ? `Modify details for ${initialData?.name}. All fields except password are mandatory.`
              : "Register a new employee. All fields are mandatory."}
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

              {/* Name field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        disabled={isLoading}
                        className="bg-background text-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Department field */}
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Engineering"
                        disabled={isLoading}
                        className="bg-background text-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Position field */}
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position / Jabatan</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background text-foreground">
                          <SelectValue placeholder="Select a position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card text-foreground">
                        <SelectItem value="Staff">Staff (Level 1 - Requestor)</SelectItem>
                        <SelectItem value="Team Lead">Team Lead (Level 2 - Approver)</SelectItem>
                        <SelectItem value="Manager">Manager (Level 3 - Approver)</SelectItem>
                        <SelectItem value="Department Head">Department Head (Level 4 - Approver)</SelectItem>
                        <SelectItem value="General Manager">General Manager (Level 5 - Approver)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Username field */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="johndoe"
                        disabled={isLoading}
                        className="bg-background text-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Leave Quota / Jatah Cuti */}
              <FormField
                control={form.control}
                name="leaveBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jatah Cuti / Leave Quota</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="12"
                        disabled={isLoading}
                        className="bg-background text-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={isEditMode ? "Leave blank to keep current password" : "••••••••"}
                        disabled={isLoading}
                        className="bg-background text-foreground"
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
                href="/employees"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  isLoading && "pointer-events-none opacity-50"
                )}
              >
                Cancel
              </Link>
              <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                {isLoading ? "Saving..." : isEditMode ? "Save Changes" : "Create Employee"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
