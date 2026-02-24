import { instance } from '../utils/axiosInstance';

export const updateProfilePicture = async (file: File) => {
  const formData = new FormData();
  formData.append('profile', file);

  const response = await instance.put('/api/users/me', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
