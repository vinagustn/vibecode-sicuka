export type Position = 'Staff' | 'Team Lead' | 'Manager' | 'Department Head' | 'General Manager';
export type Role = 'ADMIN' | 'APPROVER' | 'REQUESTOR';

export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string; // Position typings
  role: string;     // Role typings
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: string; // 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: Date;
  updatedAt: Date;
  employee?: Employee;
}

export interface UserSession {
  id: string;
  name: string;
  username: string;
  role: Role;
  position: Position;
  department: string;
}
