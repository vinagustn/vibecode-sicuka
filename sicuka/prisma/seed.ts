import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Clean existing records
  await prisma.leaveRequest.deleteMany()
  await prisma.employee.deleteMany()

  // Pre-hash passwords
  const adminPassword = await bcrypt.hash("admin123", 10)
  const defaultPassword = await bcrypt.hash("password123", 10)

  // Seed employees
  const admin = await prisma.employee.create({
    data: {
      name: "System Administrator",
      username: "admin",
      password: adminPassword,
      department: "IT / HR",
      position: "General Manager",
      role: "ADMIN",
      leaveBalance: 12,
    },
  })

  const gm = await prisma.employee.create({
    data: {
      name: "Alice Johnson",
      username: "alice",
      password: defaultPassword,
      department: "Executive Office",
      position: "General Manager",
      role: "APPROVER",
      leaveBalance: 12,
    },
  })

  const depthead = await prisma.employee.create({
    data: {
      name: "Bob Smith",
      username: "bob",
      password: defaultPassword,
      department: "Engineering",
      position: "Department Head",
      role: "APPROVER",
      leaveBalance: 12,
    },
  })

  const manager = await prisma.employee.create({
    data: {
      name: "Charlie Brown",
      username: "charlie",
      password: defaultPassword,
      department: "Engineering",
      position: "Manager",
      role: "APPROVER",
      leaveBalance: 12,
    },
  })

  const teamlead = await prisma.employee.create({
    data: {
      name: "Diana Prince",
      username: "diana",
      password: defaultPassword,
      department: "Engineering",
      position: "Team Lead",
      role: "APPROVER",
      leaveBalance: 12,
    },
  })

  const staff = await prisma.employee.create({
    data: {
      name: "Evan Wright",
      username: "evan",
      password: defaultPassword,
      department: "Engineering",
      position: "Staff",
      role: "REQUESTOR",
      leaveBalance: 12,
    },
  })

  console.log("Database seeded successfully:")
  console.log({
    admin: admin.username,
    gm: gm.username,
    depthead: depthead.username,
    manager: manager.username,
    teamlead: teamlead.username,
    staff: staff.username,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
