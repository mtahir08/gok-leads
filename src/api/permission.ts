import { instance } from '../utils/axiosInstance';

export const fetchMyPermissions = async (): Promise<string[]> => {
  const response = await instance.get('/api/users/me/permissions');
  return response.data.permissions;
};
