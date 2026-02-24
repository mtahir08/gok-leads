import { Department, IUser, UserRole } from '../types';

export const userInitialValues: Omit<IUser, '_id' | 'profile'> = {
  geekID: '',
  name: '',
  email: '',
  role: UserRole.Member,
  department: Department.Engineering,
};

export const resetPassInitialValues = {
  email: '',
  tempPass: '',
  password: '',
};
