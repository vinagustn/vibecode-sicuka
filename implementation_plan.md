# Implementation Plan - Employee Leave Management System (with Neon DB)

Implementation plan for building a monolithic Employee Leave Management System using Next.js, TypeScript, Tailwind CSS, ShadCN UI, React Hook Form, Zod, and **Neon DB (PostgreSQL) with Prisma ORM**, based on [Mini_Project_Specification_Employee_Leave_System.md](file:///D:/TRAINING/Vibe%20Coding/TaskVibeCoding/Mini_Project_Specification_Employee_Leave_System.md) and adhering to [AI_Project_Rules.md](file:///D:/TRAINING/Vibe%20Coding/TaskVibeCoding/AI_Project_Rules.md).

---

## User Review Required

> [!IMPORTANT]
> **Neon DB & Prisma ORM Integration:**
> - The application will transition from using Browser Local Storage to using a hosted PostgreSQL database on **Neon DB**.
> - We will use **Prisma ORM** for database access, schema definition, and migrations.
> - **Action Required:** You will need to provide a `DATABASE_URL` connection string from your Neon DB console and paste it into a `.env.local` file in the project root.
>
> **Role-Based Access Control (RBAC) & Position Hierarchy:**
> The system supports 3 roles: `ADMIN`, `APPROVER`, and `REQUESTOR`.
> - **Positions and Levels:**
>   1. General Manager (Level 5) - `APPROVER`
>   2. Department Head (Level 4) - `APPROVER`
>   3. Manager (Level 3) - `APPROVER`
>   4. Team Lead (Level 2) - `APPROVER`
>   5. Staff (Level 1) - `REQUESTOR`
> - **Approval Rule:**
>   An approver can only approve/reject leave requests from employees with a **strictly lower position level** (e.g., a Manager can approve a Team Lead's or Staff's request, but cannot approve a Department Head's request).
> - **Admin Bypass:**
>   The system `admin` user is not bound by the employee hierarchy and can approve/reject any request.
> - **Mock/Demo Quick-Login:**
>   The login screen will feature a "Quick Demo Login" section letting you log in as `admin` or choose from a list of dynamically created employee profiles with different positions.
>
> **Validation Rules:**
> 1. **Leave Dates:** Leave request `endDate` must be greater than or equal to (`>=`) `startDate`.
> 2. **Mandatory Fields:** All form inputs in the application are mandatory.
> 3. **Employee Duplication Check:** No duplicate employees are allowed. An employee is considered a duplicate if another employee exists with the exact same combination of `name`, `department`, and `position`.
> 4. **Start Date Limit:** The leave request `startDate` must be greater than or equal to today (`startDate >= today`). This means leave can be requested starting from today or any future date.

---

## Proposed Changes

### Component 1: Project Setup & Database Configuration

- Initialize a Next.js App Router project in the workspace root directory.
- Configure TypeScript, Tailwind CSS, and Prettier/ESLint.
- Set up ShadCN UI components (Button, Dialog, Card, Input, Label, Select, Form, Toast).
- Install dependencies: `lucide-react`, `zod`, `react-hook-form`, `@hookform/resolvers`.
- Install Prisma CLI and Client: `npm install @prisma/client` and `npm install -D prisma`.
- Initialize Prisma Schema: `npx prisma init`.
- Create `.env.local` for the `DATABASE_URL` environment variable.

#### [NEW] [package.json](file:///D:/TRAINING/Vibe%20Coding/TaskVibeCoding/package.json)
#### [NEW] [components.json](file:///D:/TRAINING/Vibe%20Coding/TaskVibeCoding/components.json)
#### [NEW] [.env.local](file:///D:/TRAINING/Vibe%20Coding/TaskVibeCoding/.env.local)

---

### Component 2: Prisma Schema & Database Client

- Create `prisma/schema.prisma` defining PostgreSQL database models for:
  - `Employee`: `id`, `name`, `department`, `position`, `role`, `username`, `createdAt`.
  - `LeaveRequest`: `id`, `employeeId`, `startDate`, `endDate`, `reason`, `status` (`PENDING`, `APPROVED`, `REJECTED`), `createdAt`.
- Set up the Prisma Client wrapper utility to prevent multiple instantiations in development.

#### [NEW] [schema.prisma](file:///D:/TRAINING/Vibe%20Coding/TaskVibeCoding/prisma/schema.prisma)
#### [NEW] [db.ts](file:///D:/TRAINING/Vibe%20Coding/TaskVibeCoding/src/lib/db.ts)

---

### Component 3: Database Seed & Server Actions (Services Layer)

Create Next.js **Server Actions** to interact with Neon DB:
- **Seed Script**: A database seed function to populate the database with default accounts (Admin and one employee of each position for quick demo testing).
- **Employee Actions (`src/app/actions/employee.ts`)**:
  - `getEmployees()`: Fetch employees from database.
  - `saveEmployee(employee)`: Create/update an employee. Validates duplicate fields before writing.
  - `deleteEmployee(id)`: Remove from database.
- **Leave Actions (`src/app/actions/leave.ts`)**:
  - `getLeaveRequests()`: Query leave requests and include employee details.
  - `saveLeaveRequest(request)`: Insert leave request.
  - `updateLeaveStatus(id, status)`: Update approval status.
- **Auth Actions (`src/app/actions/auth.ts`)**:
  - Validates credentials on the server side.
  - Generates session state saved as a secure HttpOnly cookie or simulated cookie/JWT for the client-side session.

#### [NEW] [employee.ts](file:///D:/TRAINING/Vibe%20Coding/TaskVibeCoding/src/app/actions/employee.ts)
#### [NEW] [leave.ts](file:///D:/TRAINING/Vibe%20Coding/TaskVibeCoding/src/app/actions/leave.ts)
#### [NEW] [auth.ts](file:///D:/TRAINING/Vibe%20Coding/TaskVibeCoding/src/app/actions/auth.ts)
#### [NEW] [seed.ts](file:///D:/TRAINING/Vibe%20Coding/TaskVibeCoding/prisma/seed.ts)

---

### Component 4: Shared UI Layout & Auth Guard

- Shared navigation sidebar/navbar layout.
- Dynamic navigation links depending on active session role (`ADMIN`, `APPROVER`, `REQUESTOR`).
- Auth Guard checking active session and redirecting unauthorized visits to `/login`.

#### [NEW] [Navbar.tsx](file:///D:/TRAINING/Vibe%20Coding/TaskVibeCoding/src/components/shared/Navbar.tsx)
#### [NEW] [AuthGuard.tsx](file:///D:/TRAINING/Vibe%20Coding/TaskVibeCoding/src/components/shared/AuthGuard.tsx)
#### [NEW] [layout.tsx](file:///D:/TRAINING/Vibe%20Coding/TaskVibeCoding/src/app/layout.tsx)

---

### Component 5: Login & Dashboard Modules

- **Login Page (`/login`)**:
  - Main credential inputs.
  - **Quick Demo Login Panel**: Clickable buttons representing Admin, General Manager, Department Head, Manager, Team Lead, and Staff to instantly log in as that persona (using server-action driven session generation).
- **Dashboard Page (`/dashboard`)**:
  - Metrics cards (Total, Pending, Approved, Rejected).
  - Fetched in real time from database using Server Components.
  - Metrics are scoped based on logged-in user role (Personal stats for Staff, system-wide for Admin/Approvers).

#### [NEW] [login/page.tsx](file:///D:/TRAINING/Vibe%20Coding/TaskVibeCoding/src/app/login/page.tsx)
#### [NEW] [dashboard/page.tsx](file:///D:/TRAINING/Vibe%20Coding/TaskVibeCoding/src/app/dashboard/page.tsx)

---

### Component 6: Employee CRUD Module (Admin Only)

- **List Employees (`/employees`)**:
  - Table showing employees with live database search and actions.
- **Create Employee (`/employees/new`)**:
  - Form validating duplicates on the server, saving to Neon DB.
- **Edit Employee (`/employees/edit/[id]`)**:
  - Form fetching current employee data and saving edits.

#### [NEW] [employees/page.tsx](file:///D:/TRAINING/Vibe%20Coding/TaskVibeCoding/src/app/employees/page.tsx)
#### [NEW] [employees/new/page.tsx](file:///D:/TRAINING/Vibe%20Coding/TaskVibeCoding/src/app/employees/new/page.tsx)
#### [NEW] [employees/edit/[id]/page.tsx](file:///D:/TRAINING/Vibe%20Coding/TaskVibeCoding/src/app/employees/edit/%5Bid%5D/page.tsx)
#### [NEW] [EmployeeForm.tsx](file:///D:/TRAINING/Vibe%20Coding/TaskVibeCoding/src/components/employee/EmployeeForm.tsx)

---

### Component 7: Leave Requests Module

- **List Leave Requests (`/leave`)**:
  - **Admin**: View all requests, approve/reject any pending request.
  - **Approver**: View all requests. Approve/Reject buttons are only functional/enabled for requests from employees with lower positions in the hierarchy.
  - **Requestor**: View only their own requests.
- **Create Leave Request (`/leave/new`)**:
  - All fields mandatory.
  - Start date >= today; End date >= start date.
  - Save to Neon DB via Server Action.

#### [NEW] [leave/page.tsx](file:///D:/TRAINING/Vibe%20Coding/TaskVibeCoding/src/app/leave/page.tsx)
#### [NEW] [leave/new/page.tsx](file:///D:/TRAINING/Vibe%20Coding/TaskVibeCoding/src/app/leave/new/page.tsx)
#### [NEW] [LeaveRequestForm.tsx](file:///D:/TRAINING/Vibe%20Coding/TaskVibeCoding/src/components/leave/LeaveRequestForm.tsx)

---

## Verification Plan

### Automated Tests
We will verify:
- Build process: `npm run build` completes without TypeScript or linting errors.
- Dev process: `npm run dev` starts successfully.
- DB Migration: `npx prisma db push` successfully maps schemas to Neon DB.

### Manual Verification
1. Login as **Admin**: Create a new employee, then try creating another with the same name, department, and position. Confirm the duplicate check prevents it.
2. Login as **Staff (Level 1)**: Submit a leave request. Confirm date validations:
   - `startDate < today` fails.
   - `startDate >= today` and `endDate >= startDate` succeeds.
3. Check **Team Lead (Level 2)** view: Verify they can see and approve the Staff's request.
4. Check **Manager (Level 3)** view: Verify they can see and approve the Team Lead's request, but not a Department Head's request.
5. Check **Dashboard**: Confirm all numbers correspond correctly to database counts.
