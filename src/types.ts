export type PROPS = {
  children: null | boolean | undefined | React.ReactNode;
};

export enum UserRole {
  Admin = 'admin',
  Sales = 'sales',
  BusinessAnalyst = 'b.analyst',
  Lead = 'lead',
  Member = 'member',
  Intern = 'intern',
  Board = 'board',
  PM = 'pm',
  Account = 'account',
}

export enum Department {
  Design = 'Design',
  Engineering = 'Engineering',
  Marketing = 'Marketing',
  Sales = 'Sales',
  Management = 'Management',
  HR = 'HR',
  Finance = 'Finance',
  Admin = 'Admin',
  QA = 'Quality Assurance',
  Support = 'Support',
  IT = 'Information Technology',
  Research = 'Research and Development',
  DevOps = 'DevOps',
}

export interface IUser {
  geekID: string;
  _id: string;
  name: string;
  userName?: string;
  email: string;
  password?: string;
  role: UserRole;
  department: Department;
  profile?: string;
  permissions?: string[];
}

export interface IDocument {
  _id?: string;
  name: string;
  url: string;
  tags: string[];
  createdBy?: IUser;
  createdAt?: Date;
  updatedAt?: Date;
}
