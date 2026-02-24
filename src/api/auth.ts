import { IUser } from '../types';
import { authInstance } from '../utils/axiosInstance';

export const signinUser = async (userData: Partial<IUser>) => {
  const response = await authInstance.post(`/auth/login`, userData);
  return response.data;
};

export const forgotPass = async (userData: Partial<IUser>) => {
  const response = await authInstance.post('/auth/forgot-password', userData);
  return response.data;
};

export const resetPass = async (userData: any) => {
  const response = await authInstance.post('/auth/reset-password', userData);
  return response.data;
};

export const forcedResetPass = async (userData: Partial<IUser>) => {
  const response = await authInstance.post('/auth/force-reset-password', userData);
  return response.data;
};
