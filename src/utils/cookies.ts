import { Cookies } from 'react-cookie';

const cookies = new Cookies();

export const getCookieValue = async (
  cookieName: string,
): Promise<string | undefined> => {
  return cookies.get(cookieName);
};

export const removeCookieValues = () => {
  cookies.remove('accessToken');
  cookies.remove('user');
  return 'Cookies removed';
};
